import * as gracely from "gracely"
import * as isly from "isly"
import { HasUuid } from "model/HasUuid"
import { EventWithMetadata } from "../../model"
import { Filter } from "../Filter"

export abstract class BaseListener<C extends BaseListener.Configuration> {
	constructor(protected readonly configuration: C) {}
	/**
	 * Returns configuration, used by REST-API when returning the configuration.
	 *
	 * Override to protected sensitive data. (Eg passwords)
	 */
	getConfiguration(): C {
		return this.configuration
	}
	/**
	 * This is called when the listener i configured, or reconfigured.
	 */
	abstract setup(oldConfiguration?: C): Promise<BaseListener.SetupResult | gracely.Error>

	/**
	 * Returns status of the listener.
	 * Override `getStatus` instead to add details.
	 */
	async getStatus() {
		const result: BaseListener.StatusResult = await this.addStatusDetails({ ok: true })
		// TODO: Get statistics from bucket.
		return result
	}
	/**
	 * Returns status of the listener.
	 *
	 *This is a stub, made to be overridden.
	 * Override this to add details.
	 */
	async addStatusDetails(result: BaseListener.StatusResult): Promise<BaseListener.StatusResult> {
		return result
	}

	abstract processBatch(batch: HasUuid[]): Promise<boolean[]>
}

export namespace BaseListener {
	export type SetupResult = { success: boolean; details?: (string | gracely.Error)[] }
	export type StatusResult = { ok: boolean; details?: Record<string, any> }

	export interface Configuration {
		name: string
		/**
		 * Number of events to send in every call to processBatch().
		 */
		batchSize: number
		/**
		 * Number of seconds between every batch.
		 * Note: If queue is bigger than batchSize, the calls will be directly after each other.
		 */
		batchInterval: number
		/**
		 * A selectively-expression
		 */
		filter: Filter.Configuration[]

		comment?: string
	}

	export namespace Configuration {
		export const namePattern = /^[a-z0-9_-]+$/
		export const type = isly.object<Configuration>(
			{
				name: isly.string(namePattern),
				batchSize: isly.number("positive"),
				batchInterval: isly.number("positive"),
				filter: isly.array(Filter.Configuration),
				comment: isly.optional(isly.string()),
			},
			"ListenerConfiguration"
		)
	}
}
