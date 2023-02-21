import { http, Request as httpRequest } from "cloudly-http"
import * as isly from "isly"
import { Event } from "model"

export class Analytics {
	constructor(
		protected readonly configuration: Analytics.Configuration,
		protected readonly executionContext?: ExecutionContext,
		protected readonly request?: Request
	) {}

	public async register(events: Event | Event[]): Promise<void> {
		if (!Array.isArray(events)) {
			events = [events]
		}
		const request: httpRequest.Like = {
			url: `${this.configuration.endpoint}/events`,
			method: "POST",
			body: JSON.stringify(events),
			// header: {
			// 	"content-type": "application/json;charset=UTF-8",
			// 	authorization: "Bearer " + (await this.getToken()),
			// },
		}
		if (this.executionContext) {
			this.executionContext.waitUntil(http.fetch(request))
		} else {
			await http.fetch(request)
		}
	}
}

export namespace Analytics {
	export type Configuration = { endpoint: string }
	export const Configuration = isly.object<Configuration>({ endpoint: isly.string() })
}
