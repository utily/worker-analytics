import * as isly from "isly"
import { Event } from "./Event"

export type Action = Event & Required<Pick<Event, "created">>

export namespace Action {
	export const type = isly.object<Action>(
		{
			source: isly.string(),
			entity: isly.string(),
			action: isly.string(),
			created: isly.string(),
		},
		"Event"
	)
	export const is = type.is
	export const flaw = type.flaw
}
