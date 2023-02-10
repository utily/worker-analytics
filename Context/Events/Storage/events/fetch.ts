import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as model from "../../../../model"
import { Storage } from "../../../Storage"
import { EventStorage } from ".."
import { storageRouter } from "../storageRouter"

async function fetch(
	request: http.Request,
	storageContext: Storage.Context<EventStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	try {
		const waitingEvents: model.Event[] = []
		const waitingEventBatches = await storageContext.state.storage.list<model.Event[]>()
		Array.from(waitingEventBatches.entries()).forEach(([timestamp, events]) => {
			events.forEach(event =>
				waitingEvents.push({
					created: timestamp,
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
