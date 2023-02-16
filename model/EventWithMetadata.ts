import * as isly from "isly"
import { Event } from "./Event"

export interface EventWithMetadata extends Event {
	created: string
	cloudflare?: Request["cf"]
}

export namespace EventWithMetadata {
	export const type = Event.type.extend<EventWithMetadata>(
		{
			created: isly.string(),
			cloudflare: isly.any(),
		},
		"EventWithMetaData"
	)
	export const is = type.is
	export const flaw = type.flaw
}
