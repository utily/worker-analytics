import { Context } from "./Context"

// Let endpoints register:
import "./endpoints/events"
import "./endpoints/batch"
import "./endpoints/listener"
import "./endpoints/version"
import "./endpoints/test"

// Worker:
export default {
	async fetch(request: Request, environment: Context.Environment, executionContext: ExecutionContext) {
		return await Context.handle(request, environment, executionContext)
	},
}

// Durable objects:
export const EventStorage = Context.Events.Storage
export const BucketStorage = Context.Bucket.Storage
