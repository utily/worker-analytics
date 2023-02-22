import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import * as isly from "isly"
import { router } from "router"
import { Listener } from "service/Listener"

export async function fetch(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const name = request.parameter.name
	const kvListenerConfiguration = context.listenerConfiguration
	if (gracely.Error.is(kvListenerConfiguration))
		result = kvListenerConfiguration
	else if (!isly.string().is(name))
		result = gracely.client.invalidPathArgument("listener/:name", "name", "string", "A valid identifier is required.")
	else {
		const listenerConfiguration = await kvListenerConfiguration.fetch(name)
		if (!listenerConfiguration) {
			result = gracely.client.notFound(`Listener with name "${name}" not found.`)
		} else {
			result = gracely.success.ok({
				configuration: Listener.create(listenerConfiguration.value).getConfiguration(),
				...listenerConfiguration.meta,
				status: "Not implemented",
			})
		}
	}
	return result
}
router.add("GET", "/listener/:name", fetch)
