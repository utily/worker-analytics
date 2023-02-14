import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as model from "../../../../model"
import { Storage } from "../../../../util/Storage"
import { EventStorage } from ".."
import { storageRouter } from "../storageRouter"

async function fetch(
	request: http.Request,
	storageContext: Storage.Context<EventStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	try {
		const waitingEvents: model.Event[] = []
		const waitingBatches = await storageContext.state.storage.list<model.SavedBatch>()
		Array.from(waitingBatches.entries()).forEach(([timestamp, batch]) => {
			batch.events.forEach(event =>
				waitingEvents.push({
					created: batch.created,
					...event,
				})
			)
		})
		result = gracely.success.ok(waitingEvents)
	} catch (error) {
		result = gracely.server.databaseFailure(error instanceof Error ? error.message : undefined)
	}

	return result
}

storageRouter.router.add("GET", "/events", fetch)
