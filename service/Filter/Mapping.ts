import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { AbstractFilter } from "./AbstractFilter"
import { Configuration } from "./Configuration"

export interface Mapping extends Configuration {
	type: "mapping"
	expression: string
}
export namespace Mapping {
	export const type = Configuration.type.extend<Mapping>(
		{
			type: isly.string("mapping"),
			expression: isly.string(),
		},
		"Listener.Logger"
	)

	export class Implementation extends AbstractFilter<Mapping> {
		filter(event: EventWithMetadata): EventWithMetadata | undefined {
			throw new Error("Method not implemented.")
		}
	}
}
