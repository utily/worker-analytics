import { http, Request as HttpRequest } from "cloudly-http"
import * as isly from "isly"
import { Event } from "model"
/**
 * Define extra fields in E,
 * Define type of default values in D,
 *
 * Result is a type with all properties of T and E, with all properties of D as optional.
 */
type ExtraAndDefault<T extends object, E extends object = object, D extends Partial<T & E> = never> = Omit<
	T,
	D extends never ? never : keyof D
> &
	Partial<
		{
			[K in keyof T & keyof D]: T[K] | D[K]
		}
	> &
	Omit<E, D extends never ? never : keyof D> &
	Partial<
		{
			[K in keyof E & keyof D]: E[K] | D[K]
		}
	>

type MaybeArray<T> = T | T[]

/**
 *
 * When using in worker, always provide executionContext and request.
 *
 * Generics:
 *
 * * E: Type with extra fields to add the event.
 * * D: Type of object providing default values for properties in Event and in E
 */
export class Analytics<E extends Record<string, any> = object, D extends Partial<Event & E> = never> {
	constructor(
		protected readonly configuration: Analytics.Configuration,
		protected readonly executionContext?: ExecutionContext,
		protected readonly request?: HttpRequest,
		protected readonly cloudflareProperties?: Request["cf"],
		protected readonly defaultValues: D = {} as never
	) {}
	/**
	 * In worker: (Where executionContext exists)
	 * NonBlocking. (Returns void)
	 * Usage: `analytics.register(...)`
	 *
	 * In DurableObject alarm:
	 * Returns Promise<void>
	 * Usage: `await analytics.register(...)`
	 *
	 * @param events
	 * @returns
	 */
	public register(events: MaybeArray<ExtraAndDefault<Event, E, D>>): void | Promise<void> {
		const batch = {
			events: (Array.isArray(events) ? events : [events]).map(event => ({ ...this.defaultValues, ...event })),
			cloudflare: this.cloudflareProperties,
			header: this.request?.header ?? {},
		}
		const promise: Promise<void> = http
			.fetch({
				url: `${this.configuration.endpoint}/batch`,
				method: "POST",
				body: JSON.stringify(batch),
				header: {
					"content-type": "application/json;charset=UTF-8",
					// 	authorization: "Bearer " + (await this.getToken()),
				},
			})
			.then(async response => {
				if (response.status != 201) {
					console.error(`Unexpected result from analytics-backend. (${this.configuration.endpoint})`)
					console.error(JSON.stringify(await response.body, null, 2))
				}
			})
			.catch(error => {
				console.error("Error in Analytics.register", error)
			})
		if (this.executionContext) {
			this.executionContext.waitUntil(promise)
		} else {
			return promise
		}
	}
}

export namespace Analytics {
	export type Configuration = {
		endpoint: string
		defaultValues?: Record<string, any>
	}
	export const Configuration = isly.object<Configuration>({
		endpoint: isly.string(),
		defaultValues: isly.optional(isly.record(isly.string(), isly.any())),
	})
}
