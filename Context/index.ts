import * as gracely from "gracely"
import * as http from "cloudly-http"
// import * as model from "../model"
import { router } from "../router"
import { Bucket as CBucket } from "../Storage/do/Bucket"
import { Events as CEvents } from "../Storage/do/Events"
import { ListenerConfiguration as CListenerConfiguration } from "../Storage/kv/ListenerConfiguration"
import { Configuration } from "./Configuration"
import { Environment as CEnvironment } from "./Environment"
// import { storageRouter } from "./Events/Storage/storageRouter"

export class Context {
	#events?: Context.Events | gracely.Error
	get events(): Context.Events | gracely.Error {
		return (this.#events ??=
			Context.Events.open(this.environment.eventStorage) ??
			gracely.server.misconfigured("eventStorage", "Events storage configuration missing."))
	}

	#bucket?: Context.Bucket | gracely.Error
	get bucket(): Context.Bucket | gracely.Error {
		return (this.#bucket ??=
			Context.Bucket.open(this.environment.bucketStorage) ??
			gracely.server.misconfigured("bucketStorage", "Bucket storage configuration missing."))
	}

	#listenerConfiguration?: Context.ListenerConfiguration | gracely.Error
	get listenerConfiguration(): Context.ListenerConfiguration | gracely.Error {
		return (this.#listenerConfiguration ??=
			(this.environment.listenerConfigurationStorage &&
				Context.ListenerConfiguration.open(this.environment.listenerConfigurationStorage)) ??
			gracely.server.misconfigured("listenerConfiguration", "KeyValueNamespace missing."))
	}
	constructor(
		public readonly configuration: Configuration,
		public readonly environment: Context.Environment,
		/**
		 * Incoming Request's Cloudflare Properties
		 * https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
		 */
		public readonly cloudflareProperties: Request["cf"]
	) {}

	async authenticate(request: http.Request): Promise<"admin" | undefined> {
		return this.environment.adminSecret && request.header.authorization == `Basic ${this.environment.adminSecret}`
			? "admin"
			: undefined
	}

	static async handle(request: Request, environment: Context.Environment): Promise<Response> {
		let result: http.Response
		const context = await Context.load(environment, request.cf)
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
	static async load(
		environment: Context.Environment,
		cloudflareProperties?: Request["cf"]
	): Promise<Context | undefined> {
		const configuration = await Configuration.load(environment)
		return !configuration ? undefined : new Context(configuration, environment, cloudflareProperties)
	}
}

export namespace Context {
	export type Environment = CEnvironment

	export const Events = CEvents
	export type Events = CEvents

	export const Bucket = CBucket
	export type Bucket = CBucket

	export const ListenerConfiguration = CListenerConfiguration
	export type ListenerConfiguration = CListenerConfiguration
}
