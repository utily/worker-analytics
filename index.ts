import { Context } from "./Context"

// Let endpoints register:
import "./events"
import "./listener"
import "./version"
import "./test"

// Worker:
export default {
	async fetch(request: Request, environment: Context.Environment, executionContext: ExecutionContext) {
		return await Context.handle(request, environment, executionContext)
	},
}

// Durable objects:
export const EventStorage = Context.Events.Storage
export const BucketStorage = Context.Bucket.Storage
