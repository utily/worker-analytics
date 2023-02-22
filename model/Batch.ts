import * as http from "cloudly-http"
import * as isly from "isly"
import { Event } from "./Event"

export interface Batch {
	events: Event[]
	cloudflare?: Request["cf"]
	header: http.Request["header"]
}

export namespace Batch {
	export const type = isly.object<Batch>(
		{
			events: isly.array(Event.type),
			cloudflare: isly.optional(isly.any()),
			header: isly.record(isly.string(), isly.any()),
		},
		"Batch"
	)
	export const is = type.is
	export const flaw = type.flaw
}
