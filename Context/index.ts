import * as gracely from "gracely"
import { Analytics } from "Analytics"
import * as http from "cloudly-http"
import { EventController } from "controller/Event"
import { ListenerController } from "controller/Listener"
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

	#listenerController?: ListenerController | gracely.Error
	get listenerController(): ListenerController | gracely.Error {
		const listenerConfiguration = this.listenerConfiguration
		const bucket = this.bucket
		return (this.#listenerController ??= gracely.Error.is(listenerConfiguration)
			? listenerConfiguration
			: gracely.Error.is(bucket)
			? bucket
			: new ListenerController(listenerConfiguration, bucket))
	}

	#eventController?: EventController | gracely.Error
	get eventController(): EventController | gracely.Error {
		return (this.#eventController ??= gracely.Error.is(this.events)
			? this.events
			: new EventController(this.events, this))
	}
	/**
	 * Incoming Request's Cloudflare Properties
	 * https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
	 */
	public readonly analytics: Analytics
	constructor(
		public readonly configuration: Configuration,
		public readonly environment: Context.Environment,
		public readonly executionContext?: ExecutionContext,
		public readonly request?: http.Request,
		public readonly cloudflareProperties?: Request["cf"]
	) {
		this.analytics = new Analytics(configuration.analytics, executionContext, request)
	}

	async authenticate(request: http.Request): Promise<"admin" | undefined> {
		return this.environment.adminSecret && request.header.authorization == `Basic ${this.environment.adminSecret}`
			? "admin"
			: undefined
	}

	static async handle(
		request: Request,
		environment: Context.Environment,
		executionContext: ExecutionContext
	): Promise<Response> {
		let result: http.Response
		const httpRequest = http.Request.from(request)
		const context = await Context.load(environment, executionContext, httpRequest, request.cf)
		if (!context)
			result = http.Response.create(gracely.server.misconfigured("Configuration", "Configuration is missing."))
		else {
			try {
				result = await router.handle(httpRequest, context)
			} catch (e) {
				const details = (typeof e == "object" && e && e.toString()) || undefined
				result = http.Response.create(gracely.server.unknown(details, "exception"))
			}
		}
		return http.Response.to(result)
	}
	/**
	 * Loads the context.
	 * This can be called from an Durable Object alarm which does not have
	 * executionContext neither a request.
	 */
	static async load(
		environment: Context.Environment,
		executionContext?: ExecutionContext,
		request?: http.Request,
		cloudflareProperties?: Request["cf"]
	): Promise<Context | undefined> {
		const configuration = await Configuration.load(environment)
		return !configuration
			? undefined
			: new Context(configuration, environment, executionContext, request, cloudflareProperties)
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
