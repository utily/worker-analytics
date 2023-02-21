import { Environment } from "Context/Environment"
import { Storage } from "util/Storage"
import { storageRouter } from "./storageRouter"

// Let handlers register in the storageRouter:
import "./batch"
import "./events"
import "./alarm"

export const storageProcessor = new Storage.Processor(storageRouter)

/**
 * This is the actual durable object-class
 *
 * Batcher-inspiration from
 * https://blog.cloudflare.com/durable-objects-alarms/
 */
export class EventStorage implements DurableObject {
	public lastTimestamp: number
	// public count: number
	constructor(private readonly state: DurableObjectState, private readonly environment: Environment) {
		// From: https://github.com/cloudflare/workers-chat-demo/blob/master/src/chat.mjs#L222
		// We keep track of the last-seen message's timestamp just so that we can assign monotonically
		// increasing timestamps even if multiple messages arrive simultaneously (see below). There's
		// no need to store this to disk since we assume if the object is destroyed and recreated, much
		// more than a millisecond will have gone by.
		this.lastTimestamp = 0

		// Different approach, make it possible to count.
		// this.state.blockConcurrencyWhile(async () => {
		// 	const values = await this.state.storage.list({ reverse: true, limit: 1 })
		// 	this.count = values.size == 0 ? 0 : parseInt(values.keys().next().value)
		// })
	}
	async fetch(request: Request): Promise<Response> {
		return storageProcessor.handle(request, this.environment, this.state, this)
	}
	async alarm(): Promise<void> {
		return storageProcessor.alarm(this.environment, this.state, this)
	}
}
