import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { BaseListener } from "./Base"

export interface Http extends BaseListener.Configuration {
	type: "http"
	/**
	 * Url
	 */
	target: string
}

export namespace Http {
	export const type = BaseListener.Configuration.type.extend<Http>(
		{
			type: isly.string("http"),
			target: isly.string(),
		},
		"Listener.Http"
	)
	export class Implementation extends BaseListener<Http> {
		setup(oldConfiguration?: Http | undefined): Promise<BaseListener.SetupResult> {
			return Promise.resolve({ success: true })
		}
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			throw new Error("Method not implemented.")
		}
	}
}
