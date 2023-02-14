import * as isly from "isly"
import { Event } from "./Event"

export interface EventWithMetadata extends Event {
	created: string
	cloudflareProperties?: Request["cf"]
}

export namespace EventWithMetadata {
	export const type = Event.type.extend<EventWithMetadata>(
		{
			created: isly.string(),
			cloudflareProperties: isly.any(),
		},
		"EventWithMetaData"
	)
	export const is = type.is
	export const flaw = type.flaw
}
