import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import * as isly from "isly"
import { router } from "router"

export async function fetch(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const name = request.parameter.name
	if (!isly.string().is(name))
		result = gracely.client.invalidPathArgument("listener/:name", "name", "string", "A valid identifier is required.")
	else if (gracely.Error.is(context.listenerConfiguration)) {
		result = context.listenerConfiguration
	} else {
		const value = await context.listenerConfiguration.fetch(name)
		if (!value)
			result = gracely.client.notFound(`Listener with name "${name}" not found.`)
		else if (gracely.Error.is(value))
			result = value
		else
			result = gracely.success.ok(value)
	}
	return result
}
router.add("GET", "/listener/:name", fetch)
