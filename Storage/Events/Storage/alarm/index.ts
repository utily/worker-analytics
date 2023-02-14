import * as gracely from "gracely"
import * as selectively from "selectively"
import * as model from "../../../../model"
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
	const listeners = workerContext.configuration.listeners.map(listener => ({
		name: listener.name,
		selectivelyFilter: selectively.parse(listener.filter),
	}))
	Array.from(waitingBatches.entries()).forEach(([timestamp, batch]) => {
		batch.events.forEach(event =>
			listeners.forEach(listener => {
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
		Object.entries(buckets).map(async ([listener, events]) => {
			await bucketStorage.append(listener, events)
		})
	)
	await storageContext.state.storage.deleteAll()
}
