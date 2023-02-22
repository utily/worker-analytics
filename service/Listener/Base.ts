import * as gracely from "gracely"
import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { FilterConfiguration } from "../Filter/FilterConfiguration"

export abstract class Base<C extends Base.Configuration> {
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
	abstract setup(oldConfiguration?: C): Promise<Base.SetupResult | gracely.Error>

	abstract processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]>
}

export namespace Base {
	export type SetupResult = { success: boolean; details?: (string | gracely.Error)[] }

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
		filter: FilterConfiguration[]

		comment?: string
	}

	export namespace Configuration {
		export const namePattern = /^[a-z0-9_-]+$/
		export const type = isly.object<Configuration>(
			{
				name: isly.string(namePattern),
				batchSize: isly.number("positive"),
				batchInterval: isly.number("positive"),
				filter: isly.array(FilterConfiguration),
				comment: isly.optional(isly.string()),
			},
			"ListenerConfiguration"
		)
	}
}
