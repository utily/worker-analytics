import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as isly from "isly"
import { Context } from "../../Context"
import * as model from "../../model"
import { router } from "../../router"

export async function create(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	request.header
	let result: gracely.Result
	const batch = await request.body
	// if (!request.header.authorization)
	// 	result = gracely.client.unauthorized()
	if (!model.Batch.type.is(batch))
		result = gracely.client.flawedContent(isly.array(model.Batch.type).flaw(batch))
	else if (gracely.Error.is(context.events))
		result = context.events
	else {
		console.log(batch)
		const response = await context.events.addBatch(batch)
		result = gracely.Error.is(response) ? gracely.server.databaseFailure(response) : gracely.success.created(response)
	}
	return result
}
router.add("POST", "/batch", create)
