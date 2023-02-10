import * as isly from "isly"
import { Event } from "./Event"

export type Action = Event & Required<Pick<Event, "created">>

export namespace Action {
	export const type = Event.type.extend<Action>(
		{
			created: isly.string(),
		},
		"Action"
	)
	export const is = type.is
	export const flaw = type.flaw
}
