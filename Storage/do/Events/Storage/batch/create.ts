import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as model from "model"
import { SavedBatch } from "model/SavedBatch"
import { Storage } from "util/Storage"
import { EventStorage } from ".."
import { storageRouter } from "../storageRouter"

const SECONDS = 1000

async function create(
	request: http.Request,
	storageContext: Storage.Context<EventStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const batch = await request.body
	if (!model.Batch.type.is(batch))
		result = gracely.client.flawedContent(model.Batch.flaw(batch))
	else {
		try {
			// Add timestamp. Here's where this.lastTimestamp comes in -- if we receive a bunch of
			// messages at the same time (or if the clock somehow goes backwards????), we'll assign
			// them sequential timestamps, so at least the ordering is maintained.
			const timestamp = Math.max(Date.now(), storageContext.durableObject.lastTimestamp + 1)
			storageContext.durableObject.lastTimestamp = timestamp

			const savedBatch: SavedBatch = { ...batch, created: new Date(timestamp).toISOString() }
			await storageContext.state.storage.put<model.Batch>(savedBatch.created, savedBatch)
			// If there is no alarm currently set, set one for 10 seconds from now
			// Any further POSTs in the next 10 seconds will be part of this kh.
			if ((await storageContext.state.storage.getAlarm()) == null)
				await storageContext.state.storage.setAlarm(Date.now() + 5 * SECONDS)

			result = gracely.success.created(savedBatch.events)
		} catch (error) {
			result = gracely.server.databaseFailure(error instanceof Error ? error.message : undefined)
		}
	}
	return result
}

storageRouter.router.add("POST", "/batch", create)
