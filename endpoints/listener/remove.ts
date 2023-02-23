import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import * as isly from "isly"
import { router } from "router"

export async function remove(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const name = request.parameter.name
	if (!isly.string().is(name))
		result = gracely.client.invalidPathArgument("listener/:name", "name", "string", "A valid identifier is required.")
	else if (gracely.Error.is(context.listenerController)) {
		result = context.listenerController
	} else {
		if (!(await context.listenerController.remove(name)))
			result = gracely.client.notFound(`No listener found with the name ${name}.`)
		else
			result = gracely.success.ok(true)
	}
	return result
}
router.add("DELETE", "/listener/:name", remove)
