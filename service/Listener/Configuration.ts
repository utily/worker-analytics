import * as isly from "isly"
import { FilterConfiguration } from "../Filter/FilterConfiguration"

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
