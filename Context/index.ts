import * as gracely from "gracely"
import * as http from "cloudly-http"
import * as storage from "cloudly-storage"
// import * as model from "../model"
import { router } from "../router"
import { Actions as CActions } from "./Actions"
import { Configuration } from "./Configuration"
import { Environment as CEnvironment } from "./Environment"
import { Events as CEvents } from "./Events"
// import { storageRouter } from "./Events/Storage/storageRouter"

export class Context {
	#events?: Context.Events | gracely.Error
	get events(): Context.Events | gracely.Error {
		return (this.#events ??=
			Context.Events.open(storage.DurableObject.Namespace.open(this.environment.eventStorage)) ??
			gracely.server.misconfigured("eventStorage", "Events storage configuration missing."))
	}
	#actions?: Context.Actions | gracely.Error
	get actions(): Context.Actions | gracely.Error {
		return (this.#actions ??=
			Context.Actions.open(storage.DurableObject.Namespace.open(this.environment.actionStorage)) ??
			gracely.server.misconfigured("actionStorage", "Actions storage configuration missing."))
	}

	constructor(public readonly configuration: Configuration, public readonly environment: Context.Environment) {}

	async authenticate(request: http.Request): Promise<"admin" | undefined> {
		return this.environment.adminSecret && request.header.authorization == `Basic ${this.environment.adminSecret}`
			? "admin"
			: undefined
	}

	static async handle(request: Request, environment: Context.Environment): Promise<Response> {
		let result: http.Response
		const context = await Context.load(environment)
		if (!context)
			result = http.Response.create(gracely.server.misconfigured("Configuration", "Configuration is missing."))
		else {
			try {
				result = await router.handle(http.Request.from(request), context)
			} catch (e) {
				const details = (typeof e == "object" && e && e.toString()) || undefined
				result = http.Response.create(gracely.server.unknown(details, "exception"))
			}
		}
		return http.Response.to(result)
	}
	static async load(environment: Context.Environment): Promise<Context | undefined> {
		const configuration = await Configuration.load(environment)
		return !configuration ? undefined : new Context(configuration, environment)
	}
}

export namespace Context {
	export type Environment = CEnvironment

	export const Events = CEvents
	export type Events = CEvents

	export const Actions = CActions
	export type Actions = CActions
}
