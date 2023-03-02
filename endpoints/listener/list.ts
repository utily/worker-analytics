import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "../../Context"
import { router } from "../../router"

export async function list(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	let result: gracely.Result
	if (gracely.Error.is(context.listenerConfiguration)) {
		result = context.listenerConfiguration
	} else {
		const value = await context.listenerConfiguration.listKeys()
		if (gracely.Error.is(value))
			result = value
		else
			result = gracely.success.ok(value)
	}

	return result
}
router.add("GET", "/listener", list)
