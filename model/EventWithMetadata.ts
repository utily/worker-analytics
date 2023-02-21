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
export const EventWithMetadata = Event.extend<EventWithMetadata>(
	{
		created: isly.string(),
		cloudflare: isly.any(),
	},
	"EventWithMetaData"
)
export namespace EventWithMetadata {
	export type Selector = keyof EventWithMetadata | `cloudflare.${keyof Required<EventWithMetadata>["cloudflare"]}`
}
