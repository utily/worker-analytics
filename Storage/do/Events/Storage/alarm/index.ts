import * as gracely from "gracely"
import * as model from "model"
import { Filter } from "service/Filter"
import { BaseFilter } from "service/Filter/Base"
import { Listener } from "service/Listener"
import { generateKeyBatch } from "util/Storage/functions"
import { storageRouter } from "../storageRouter"
type CompiledListeners = Record<string, Listener.Configuration & { filterImplementations: BaseFilter[] }>

function* generateBucket(waitingBatches: Map<string, model.Batch>, listeners: CompiledListeners) {
	const buckets: Record<string, object[]> = {}
	const bucketsSize: Record<string, number> = {}
	for (const [timestamp, batch] of waitingBatches.entries()) {
		for (const event of batch.events) {
			for (const listener of Object.values(listeners)) {
				const eventWithMetaData: model.EventWithMetadata = {
					created: timestamp,
					cloudflare: batch.cloudflare,
					header: batch.header,
					...event,
				}
				// Run all filters on this eventWithMetaData
				const filteredValue = listener.filterImplementations.reduce<object | undefined>((filterValue, filter) => {
					console.log(`Filter, value before ${filter.type}:`, filterValue)
					return filterValue ? filter.filter(filterValue) : filterValue
				}, eventWithMetaData)
				console.log(`Filtered value:`, filteredValue)

				if (filteredValue) {
					// Limit for bucket is: 131072 bytes
					const size = JSON.stringify(filteredValue).length
					let accumulatedSize = (bucketsSize[listener.name] ?? 0) + size + 1
					// Unknown how the serialization is done, when the value is stored.
					// We need som margins here:
					if (accumulatedSize > 100 * 1024) {
						yield [listener.name, buckets[listener.name]] as const
						accumulatedSize = size
						buckets[listener.name] = []
					}
					;(buckets[listener.name] ??= []).push(filteredValue)
					bucketsSize[listener.name] = accumulatedSize
				}
			}
		}
	}
	for (const bucket of Object.entries(buckets)) {
		yield bucket
	}
}

storageRouter.alarm = async function alarm(storageContext) {
	// Dynamic import to avoid Circular dependency:
	const { Context } = await import("Context")
	const workerContext = await Context.load(storageContext.environment)
	if (!workerContext)
		throw gracely.server.misconfigured("Configuration", "Configuration is missing.")

	const kvListenerConfiguration = workerContext.listenerConfiguration
	if (gracely.Error.is(kvListenerConfiguration))
		throw kvListenerConfiguration

	const waitingBatches = await storageContext.state.storage.list<model.Batch>()
	//const buckets: Record<string, model.EventWithMetadata[]> = {}
	const listeners: CompiledListeners = Object.fromEntries(
		(await kvListenerConfiguration.listValues()).map(listener => [
			listener.name,
			{
				...listener,
				filterImplementations: Filter.createList(listener.filter),
			},
		])
	)

	const bucketStorage = workerContext.bucket
	if (gracely.Error.is(bucketStorage)) {
		throw bucketStorage
	}
	for (const [listenerName, events] of generateBucket(waitingBatches, listeners)) {
		console.log(`Filling bucket "${listenerName}" with ${events.length} events.`)
		const appendResult = await bucketStorage.append(listeners[listenerName], events)
		if (gracely.Error.is(appendResult)) {
			console.error(appendResult)
		}
	}
	// Delete bucketed values:
	for (const keyBatch of generateKeyBatch(waitingBatches, 128)) {
		await storageContext.state.storage.delete(keyBatch)
	}
}
