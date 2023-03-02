import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import { router } from "router"
import { Listener } from "service/Listener"

export async function create(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const listenerConfiguration = await request.body
	// if (!request.header.authorization)
	// 	result = gracely.client.unauthorized()
	// else

	if (!Listener.Configuration.is(listenerConfiguration))
		result = gracely.client.flawedContent(Listener.Configuration.flaw(listenerConfiguration))
	else if (gracely.Error.is(context.listenerConfiguration))
		result = context.listenerConfiguration
	else {
		const createResult = await context.listenerConfiguration.create(listenerConfiguration)
		if (gracely.Error.is(createResult)) {
			result = createResult
		} else
			result = gracely.success.created(createResult)
	}
	return result
}
router.add("POST", "/listener", create)
