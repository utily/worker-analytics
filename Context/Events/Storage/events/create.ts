import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as isly from "isly"
import * as model from "../../../../model"
import { Storage } from "../../../Storage"
import { EventStorage } from ".."
import { storageRouter } from "../storageRouter"

const SECONDS = 1000

async function create(
	request: http.Request,
	storageContext: Storage.Context<EventStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const events = await request.body
	if (!isly.array(model.Event.type).is(events))
		result = gracely.client.flawedContent(model.Event.flaw(events) as any)
	else {
		try {
			// Add timestamp. Here's where this.lastTimestamp comes in -- if we receive a bunch of
			// messages at the same time (or if the clock somehow goes backwards????), we'll assign
			// them sequential timestamps, so at least the ordering is maintained.
			const timestamp = Math.max(Date.now(), storageContext.durableObject.lastTimestamp + 1)
			storageContext.durableObject.lastTimestamp = timestamp

			await storageContext.state.storage.put<model.Event[]>(new Date(timestamp).toISOString(), events)
			// If there is no alarm currently set, set one for 10 seconds from now
			// Any further POSTs in the next 10 seconds will be part of this kh.
			if ((await storageContext.state.storage.getAlarm()) == null) {
				await storageContext.state.storage.setAlarm(Date.now() + 10 * SECONDS)
			}

			result = gracely.success.created(events)
		} catch (error) {
			result = gracely.server.databaseFailure(error instanceof Error ? error.message : undefined)
		}
	}
	return result
}

storageRouter.router.add("POST", "/events", create)
