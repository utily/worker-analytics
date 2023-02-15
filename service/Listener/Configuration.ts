import * as isly from "isly"

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
	batchDuration: number
	/**
	 * A selectively-expression
	 */
	filter: string

	comment?: string
}
export namespace Configuration {
	export const type = isly.object<Configuration>(
		{
			name: isly.string(/^[a-z0-9_-]+$/),
			batchSize: isly.number("positive"),
			batchDuration: isly.number("positive"),
			filter: isly.string(),
			comment: isly.optional(isly.string()),
		},
		"ListenerConfiguration"
	)
}
