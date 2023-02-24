import * as model from "model"
import { Listener } from "service/Listener"
import { generateKeyBatch } from "util/Storage/functions"
import { storageRouter } from "../storageRouter"

/**
 * WaitingBatches is stored in the Bucket. This generator function read these,
 * and make new batches of specific size for listener.
 *
 * This is a generator function:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
 *
 * @param waitingBatches
 * @param size
 */
function* generateListenerBatch(waitingBatches: Map<string, model.HasUuid[]>, size: number) {
	let batch: model.HasUuid[] = []
	for (const waitingBatch of waitingBatches.values()) {
		for (const event of waitingBatch) {
			batch.push(event)
			if (batch.length >= size) {
				yield batch
				batch = []
			}
		}
	}
	if (batch.length > 0)
		yield batch
}

storageRouter.alarm = async function (storageContext) {
	const listenerConfiguration = await storageContext.durableObject.getListenerConfiguration()
	if (!listenerConfiguration)
		throw new Error("No listenerConfiguration in bucket.")
	const listener = Listener.create(listenerConfiguration)

	try {
		const waitingEventBatches = await storageContext.state.storage.list<model.HasUuid[]>({
			prefix: "/events/",
		})
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
		for (const listenerBatch of generateListenerBatch(waitingEventBatches, listenerConfiguration.batchSize)) {
			const failedValues = (await listener.processBatch(listenerBatch)).flatMap((result, index) =>
				result ? [] : [listenerBatch[index]]
			)
			// Save failed objects:
			if (failedValues.length > 0) {
				console.error(`Listener ${listenerConfiguration.name}/alarm failed to store ${failedValues.length} objects.`)
				await storageContext.state.storage.put<model.HasUuid[]>(
					`/failed/${new Date(storageContext.durableObject.getUniqueTimestamp()).toISOString()}`,
					failedValues
				)
			}
		}
		//delete takes a maximum of 128 keys
		for (const keyBatch of generateKeyBatch(waitingEventBatches, 128)) {
			await storageContext.state.storage.delete(keyBatch)
		}
	} catch (error) {
		console.error(`Listener ${listenerConfiguration.name}/alarm:`, error)
	}
}
