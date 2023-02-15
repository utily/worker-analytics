import * as gracely from "gracely"
import * as http from "cloudly-http"
import { ListenerConfiguration } from "../../../../service/Listener/ListenerConfiguration"
import { Storage } from "../../../../util/Storage"
import { BucketStorage } from ".."
import { storageRouter } from "../storageRouter"

export async function create(
	request: http.Request,
	context: Storage.Context<BucketStorage>
): Promise<http.Response.Like | any> {
	let result: gracely.Result
	const configuration = await request.body
	if (!ListenerConfiguration.type.is(configuration))
		result = gracely.client.flawedContent(ListenerConfiguration.type.flaw(configuration)!)
	else {
		try {
			await context.state.storage.put<ListenerConfiguration>("/configuration", configuration)

			result = gracely.success.created(configuration)
		} catch (error) {
			result = gracely.server.databaseFailure(error instanceof Error ? error.message : undefined)
		}
	}
	return result
}

storageRouter.router.add("POST", "/configuration", create)
