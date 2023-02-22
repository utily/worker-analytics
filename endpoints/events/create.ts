import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as isly from "isly"
import { Context } from "../../Context"
import * as model from "../../model"
import { router } from "../../router"

export async function create(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	request.header
	let result: gracely.Result
	let events = await request.body
	// if (!request.header.authorization)
	// 	result = gracely.client.unauthorized()
	if (!(model.Event.type.is(events) || isly.array(model.Event.type).is(events)))
		result = gracely.client.flawedContent(isly.array(model.Event.type).flaw(events))
	else if (gracely.Error.is(context.events))
		result = context.events
	else {
		if (!Array.isArray(events)) {
			events = [events]
		}
		console.log(events)
		const batch: model.Batch = {
			events,
			cloudflare: context.cloudflareProperties,
			header: request.header,
		}
		const response = await context.events.addBatch(batch)
		result = gracely.Error.is(response) ? gracely.server.databaseFailure(response) : gracely.success.created(response)
	}
	return result
}
router.add("POST", "/events", create)
1
