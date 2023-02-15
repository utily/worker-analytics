import * as gracely from "gracely"
import * as selectively from "selectively"
import * as model from "../../../../model"
import { generateKeyBatch } from "../../../../util/Storage/functions"
import { storageRouter } from "../storageRouter"

storageRouter.alarm = async function alarm(storageContext) {
	// Dynamic import to avoid Circular dependency:
	const { Context } = await import("../../../../Context")
	const workerContext = await Context.load(storageContext.environment)
	if (!workerContext) {
		throw gracely.server.misconfigured("Configuration", "Configuration is missing.")
	}

	const waitingBatches = await storageContext.state.storage.list<model.Batch>()
	const buckets: Record<string, model.EventWithMetadata[]> = {}
	const listeners = Object.fromEntries(
		workerContext.configuration.listeners.map(listener => [
			listener.name,
			{
				...listener,
				selectivelyFilter: selectively.parse(listener.filter),
			},
		])
	)

	Array.from(waitingBatches.entries()).forEach(([timestamp, batch]) => {
		batch.events.forEach(event =>
			Object.values(listeners).forEach(listener => {
				const eventWithMetaData: model.EventWithMetadata = {
					created: timestamp,
					cloudflareProperties: batch.cloudflareProperties,
					...event,
				}
				if (listener.selectivelyFilter.is(eventWithMetaData)) {
					;(buckets[listener.name] ??= []).push(eventWithMetaData)
				}
			})
		)
	})
	const bucketStorage = workerContext.bucket
	if (gracely.Error.is(bucketStorage)) {
		throw bucketStorage
	}
	await Promise.all(
		Object.entries(buckets).map(async ([listenerName, events]) => {
			console.log(`Filling bucket ${listenerName} with ${events.length} events.`)
			await bucketStorage.append(listeners[listenerName], events)
		})
	)
	// Delete bucketed values:
	for (const keyBatch of generateKeyBatch(waitingBatches, 128)) {
		await storageContext.state.storage.delete(keyBatch)
	}
}
