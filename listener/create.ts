import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import { router } from "router"
import { Listener } from "service/Listener"

export async function create(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const listenerConfiguration = await request.body
	const kvListenerConfiguration = context.listenerConfiguration
	// if (!request.header.authorization)
	// 	result = gracely.client.unauthorized()
	// else
	if (gracely.Error.is(kvListenerConfiguration))
		result = kvListenerConfiguration
	else if (!Listener.ListenerConfiguration.is(listenerConfiguration))
		result = gracely.client.flawedContent(Listener.ListenerConfiguration.flaw(listenerConfiguration))
	else {
		const setupResult = await Listener.create(listenerConfiguration).setup()
		if (setupResult !== true) {
			result = setupResult
		} else {
			//TODO update config in bucket!
			await kvListenerConfiguration.create(listenerConfiguration)
			result = gracely.success.created(listenerConfiguration)
		}
	}
	return result
}
router.add("POST", "/listener", create)
