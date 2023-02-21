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
		breakHere: if (gracely.Error.is(setupResult)) {
			result = setupResult
		} else {
			if (setupResult.success) {
				await kvListenerConfiguration.create(listenerConfiguration)
				//TODO update config in bucket!

				const fetchedListenerConfiguration = await kvListenerConfiguration.fetch(listenerConfiguration.name)
				if (fetchedListenerConfiguration) {
					;(setupResult.details ??= []).push("Listenerconfiguration stored in KeyValue-store.")
					result = gracely.success.created({
						setup: setupResult,
						configuration: Listener.create(fetchedListenerConfiguration.value).getConfiguration(),
						...fetchedListenerConfiguration.meta,
					})
					break breakHere
				} else {
					setupResult.success = false
					;(setupResult.details ??= []).push("Failed to store listenerconfiguration in KeyValue-store.")
				}
			}
			result = gracely.server.backendFailure(setupResult.details ?? "Setup failed.")
		}
	}
	return result
}
router.add("POST", "/listener", create)
