import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { Base } from "./Base"
export interface Logger extends Base.Configuration {
	type: "logger"
	/**
	 * Url
	 */
}
export namespace Logger {
	export const type = Base.Configuration.type.extend<Logger>(
		{
			type: isly.string("logger"),
		},
		"Listener.Logger"
	)

	export class Implementation extends Base<Logger> {
		setup() {
			console.log(`Listener.logger setup. (Name: ${this.configuration.name})`)
			return Promise.resolve({ success: true as const })
		}
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			console.log(`Listener.Logger (Name: ${this.configuration.name}, BatchSize: ${this.configuration.batchSize})`)
			console.log(batch)
			return Promise.resolve(batch.map(() => true))
		}
	}
}
