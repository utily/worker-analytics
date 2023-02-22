import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { Base } from "./Base"

export interface Http extends Base.Configuration {
	type: "http"
	/**
	 * Url
	 */
	target: string
}

export namespace Http {
	export const type = Base.Configuration.type.extend<Http>(
		{
			type: isly.string("http"),
			target: isly.string(),
		},
		"Listener.Http"
	)
	export class Implementation extends Base<Http> {
		setup(oldConfiguration?: Http | undefined): Promise<Base.SetupResult> {
			return Promise.resolve({ success: true })
		}
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			throw new Error("Method not implemented.")
		}
	}
}
