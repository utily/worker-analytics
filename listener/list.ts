import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "../Context"
import { router } from "../router"

export async function list(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const kvListenerConfiguration = context.listenerConfiguration
	if (gracely.Error.is(kvListenerConfiguration))
		result = kvListenerConfiguration
	else {
		result = gracely.success.ok(kvListenerConfiguration.listKeys())
	}
	return result
}
router.add("GET", "/listener", list)
