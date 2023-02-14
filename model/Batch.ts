import * as isly from "isly"
import { Event } from "./Event"

export interface Batch {
	events: Event[]
	cloudflareProperties?: Request["cf"]
}

export namespace Batch {
	export const type = isly.object<Batch>(
		{
			events: isly.array(Event.type),
			cloudflareProperties: isly.optional(isly.any()),
		},
		"Batch"
	)
	export const is = type.is
	export const flaw = type.flaw
}
