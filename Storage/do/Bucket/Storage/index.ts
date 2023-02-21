import { Environment } from "Context/Environment"
import { ListenerConfiguration } from "service/Listener/ListenerConfiguration"
import { Storage } from "util/Storage"
import { storageRouter } from "./storageRouter"

// Let handlers register in the storageRouter!
import "./configuration"
import "./events"
import "./alarm"

export const storageProcessor = new Storage.Processor(storageRouter)

/**
 * This is the actual durable object-class
 *
 * Batcher-inspiration from
 * https://blog.cloudflare.com/durable-objects-alarms/
 */
export class BucketStorage implements DurableObject {
	public lastTimestamp: number

	private listenerConfiguration: ListenerConfiguration | undefined
	public async getListenerConfiguration(): Promise<ListenerConfiguration | undefined> {
		return (this.listenerConfiguration ??= await this.state.storage.get<ListenerConfiguration>("/configuration"))
	}
	// private listenerState: Record<string, any> | undefined | false
	// public async getListenerState(): Promise<Record<string, any> | undefined> {
	// 	this.listenerState ??= (await this.state.storage.get<Record<string, any>>("/state")) ?? false
	// 	return this.listenerState || undefined
	// }
	// /**
	//  * Noop if value is undefined
	//  * @param value
	//  * @returns
	//  */
	// public async setListenerState(value: Record<string, any> | undefined) {
	// 	if (value) {
	// 		await this.state.storage.put<Record<string, any>>("/state", value)
	// 		this.listenerState = value
	// 	}
	// 	return this.listenerState || undefined
	// }

	constructor(private readonly state: DurableObjectState, private readonly environment: Environment) {
		// From: https://github.com/cloudflare/workers-chat-demo/blob/master/src/chat.mjs#L222
		// We keep track of the last-seen message's timestamp just so that we can assign monotonically
		// increasing timestamps even if multiple messages arrive simultaneously (see below). There's
		// no need to store this to disk since we assume if the object is destroyed and recreated, much
		// more than a millisecond will have gone by.
		this.lastTimestamp = 0
	}
	async fetch(request: Request): Promise<Response> {
		return storageProcessor.handle(request, this.environment, this.state, this)
	}
	async alarm(): Promise<void> {
		return storageProcessor.alarm(this.environment, this.state, this)
	}
}
