import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as isly from "isly"
import * as model from "../../../../model"
import { Storage } from "../../../Storage"
import { ActionStorage } from ".."
import { storageRouter } from "../storageRouter"

const SECONDS = 1000

export async function create(
	request: http.Request,
	context: Storage.Context<ActionStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const actions = await request.body
	if (!isly.array(model.Action.type).is(actions))
		result = gracely.client.flawedContent(model.Action.flaw(actions) as any)
	else {
		try {
			// Add timestamp. Here's where this.lastTimestamp comes in -- if we receive a bunch of
			// messages at the same time (or if the clock somehow goes backwards????), we'll assign
			// them sequential timestamps, so at least the ordering is maintained.
			const timestamp = Math.max(Date.now(), context.durableObject.lastTimestamp + 1)
			context.durableObject.lastTimestamp = timestamp

			await context.state.storage.put<model.Action[]>(new Date(timestamp).toISOString(), actions)
			// If there is no alarm currently set, set one for 10 seconds from now
			// Any further POSTs in the next 10 seconds will be part of this kh.
			if ((await context.state.storage.getAlarm()) == null) {
				await context.state.storage.setAlarm(Date.now() + 10 * SECONDS)
			}

			result = gracely.success.created(actions)
		} catch (error) {
			result = gracely.server.databaseFailure(error instanceof Error ? error.message : undefined)
		}
	}
	return result
}

storageRouter.router.add("POST", "/actions", create)
