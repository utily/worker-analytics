import { Context } from "./Context"

// Let endpoints register:
import "./events"
import "./listener"
import "./version"

// Worker:
export default {
	async fetch(request: Request, environment: Context.Environment) {
		return await Context.handle(request, environment)
	},
}

// Durable objects:
export const EventStorage = Context.Events.Storage
export const BucketStorage = Context.Bucket.Storage
