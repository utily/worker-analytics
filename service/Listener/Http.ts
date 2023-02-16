import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { AbstractListener } from "./AbstractListener"
import { Configuration } from "./Configuration"

export interface Http extends Configuration {
	type: "http"
	/**
	 * Url
	 */
	target: string
}
export namespace Http {
	export const type = Configuration.type.extend<Http>(
		{
			type: isly.string("http"),
			target: isly.string(),
		},
		"Listener.Http"
	)
	export class Implementation extends AbstractListener<Http> {
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			throw new Error("Method not implemented.")
		}
	}
}
