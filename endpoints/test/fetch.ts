import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Context } from "Context"
import { router } from "router"

export async function fetch(request: http.Request, context: Context): Promise<http.Response.Like | any> {
	context.analytics.register({ source: "worker-analytics-test", action: "purchased", entity: "order" })

	return gracely.success.noContent()
}
router.add("GET", "/test", fetch)
