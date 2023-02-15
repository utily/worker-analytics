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
		processBatch(batch: EventWithMetadata[]): Promise<boolean[]> {
			console.log(
				`Listener.Logger (Name: ${this.listenerConfiguration.name}, BatchSize: ${this.listenerConfiguration.batchSize})`
			)
			console.log(batch.map(event => event.created))
			return Promise.resolve(batch.map(() => true))
		}
	}
}
