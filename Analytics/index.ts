import { http, Request as HttpRequest } from "cloudly-http"
import * as isly from "isly"
import { Event } from "model"

/**
 * When using in worker, always provide executionContext and request.
 */
export class Analytics {
	constructor(
		protected readonly configuration: Analytics.Configuration,
		protected readonly executionContext?: ExecutionContext,
		protected readonly request?: HttpRequest,
		protected readonly cloudflareProperties?: Request["cf"]
	) {}
	/**
	 * In worker: (Where executionContext exists)
	 * NonBlocking. (Returns void)
	 * Usage: `analytics.register(...)`
	 *
	 * In DurableObject alarm: Returns Promise<void>
	 * Usage: `await analytics.register(...)`
	 *
	 * @param events
	 * @returns
	 */
	public register(events: Event | Event[]): void | Promise<void> {
		if (!Array.isArray(events)) {
			events = [events]
		}
		const promise: Promise<void> = http
			.fetch({
				url: `${this.configuration.endpoint}/events`,
				method: "POST",
				body: JSON.stringify(events),
				// header: {
				// 	"content-type": "application/json;charset=UTF-8",
				// 	authorization: "Bearer " + (await this.getToken()),
				// },
			})
			.then(response => {
				if (!(response.status != 201)) {
					console.error("Unexpected result from analytics-backend.")
					console.error(response.body)
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
	export type Configuration = { endpoint: string }
	export const Configuration = isly.object<Configuration>({ endpoint: isly.string() })
}
