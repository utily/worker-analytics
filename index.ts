import { Context } from "./Context"

import "./events"
import "./version"

// Worker:
export default {
	async fetch(request: Request, environment: Context.Environment) {
		return await Context.handle(request, environment)
	},
}

// Durable objects:
export const EventStorage = Context.Events.Storage
export const ActionStorage = Context.Actions.Storage
