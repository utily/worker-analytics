import * as isly from "isly"
import { Event } from "./Event"

export interface EventWithMetadata extends Event {
	created: string
	cloudflare?: Request["cf"]
}

/**
 * Used for autocomplete in IDE.
 * Usage: EventWithMetadataSelector | (string & Record<never, never>)
 */

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
	export type Selector = keyof EventWithMetadata | `cloudflare.${keyof Required<EventWithMetadata>["cloudflare"]}`
}
