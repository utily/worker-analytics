import * as gracely from "gracely"
import * as http from "cloudly-http"
import { Environment } from "../../Context/Environment"
import { Context } from "./Context"
import { Router } from "./Router"

export class Processor<DO extends DurableObject> {
	constructor(public readonly storageRouter: Router<DO>) {}
	/**
	 * The DurableObject is calling this method
	 */
	async handle(
		request: Request,
		environment: Environment,
		state: DurableObjectState,
		durableObject: DO
	): Promise<Response> {
		let result: http.Response
		try {
			result = await this.storageRouter.router.handle(
				http.Request.from(request),
				new Context<DO>(environment, state, durableObject)
			)
		} catch (e) {
			const details = (typeof e == "object" && e && e.toString()) || undefined
			result = http.Response.create(gracely.server.unknown(details, "exception"))
		}
		return http.Response.to(result)
	}
	/**
	 * The DurableObject is calling this method
	 */
	async alarm(environment: Environment, state: DurableObjectState, durableObject: DO): Promise<void> {
		const storageContext = new Context<DO>(environment, state, durableObject)
		if (this.storageRouter.alarm) {
			await this.storageRouter.alarm(storageContext)
		} else {
			console.error("No alarm-handler is registered.")
		}
	}
}
