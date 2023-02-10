import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as isly from "isly"
import { Context } from "../Context"
import * as model from "../model"
import { router } from "../router"

export async function create(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const events = await request.body
	// if (!request.header.authorization)
	// 	result = gracely.client.unauthorized()

	if (!isly.array(model.Event.type).is(events))
		result = gracely.client.flawedContent(isly.array(model.Event.type).flaw(events)!)
	else if (gracely.Error.is(context.events))
		result = context.events
	else {
		console.log(events)
		const response = await context.events.create(events)
		result = gracely.Error.is(response) ? gracely.server.databaseFailure(response) : gracely.success.created(response)
	}
	return result
}
router.add("POST", "/events", create)
1
