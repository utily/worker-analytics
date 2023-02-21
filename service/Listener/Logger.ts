import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { AbstractListener } from "./AbstractListener"
import { Configuration } from "./Configuration"
export interface Logger extends Configuration {
	type: "logger"
	/**
	 * Url
	 */
}
export namespace Logger {
	export const type = Configuration.type.extend<Logger>(
		{
			type: isly.string("logger"),
		},
		"Listener.Logger"
	)

	export class Implementation extends AbstractListener<Logger> {
		setup(): Promise<true> {
			console.log(`Listener.logger setup. (Name: ${this.configuration.name})`)
			return Promise.resolve(true)
		}
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			console.log(`Listener.Logger (Name: ${this.configuration.name}, BatchSize: ${this.configuration.batchSize})`)
			console.log(batch)
			return Promise.resolve(batch.map(() => true))
		}
	}
}
