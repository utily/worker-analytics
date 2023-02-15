import * as gracely from "gracely"
import * as selectively from "selectively"
import * as model from "../../../../model"
import { ListenerConfiguration } from "../../../../service/Listener/ListenerConfiguration"
import { generateKeyBatch } from "../../../../util/Storage/functions"
import { storageRouter } from "../storageRouter"
type CompiledListeners = Record<string, ListenerConfiguration & { selectivelyFilter: selectively.Rule }>

function* generateBucket(waitingBatches: Map<string, model.Batch>, listeners: CompiledListeners) {
	const buckets: Record<string, model.EventWithMetadata[]> = {}
	const bucketsSize: Record<string, number> = {}
	for (const [timestamp, batch] of waitingBatches.entries()) {
		for (const event of batch.events) {
			for (const listener of Object.values(listeners)) {
				const eventWithMetaData: model.EventWithMetadata = {
					created: timestamp,
					cloudflareProperties: batch.cloudflareProperties,
					...event,
				}
				if (listener.selectivelyFilter.is(eventWithMetaData)) {
					// Limit for bucket is: 131072 bytes
					const size = JSON.stringify(eventWithMetaData).length
					let accumulatedSize = (bucketsSize[listener.name] ?? 0) + size + 1
					// Unknown how the serialization is done, when the value is stored.
					// We need som margins here:
					if (accumulatedSize > 100 * 1024) {
						yield [listener.name, buckets[listener.name]] as const
						accumulatedSize = size
						buckets[listener.name] = []
					}
					;(buckets[listener.name] ??= []).push(eventWithMetaData)
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
	const { Context } = await import("../../../../Context")
	const workerContext = await Context.load(storageContext.environment)
	if (!workerContext) {
		throw gracely.server.misconfigured("Configuration", "Configuration is missing.")
	}

	const waitingBatches = await storageContext.state.storage.list<model.Batch>()
	//const buckets: Record<string, model.EventWithMetadata[]> = {}
	const listeners: CompiledListeners = Object.fromEntries(
		workerContext.configuration.listeners.map(listener => [
			listener.name,
			{
				...listener,
				selectivelyFilter: selectively.parse(listener.filter),
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
