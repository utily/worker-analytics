import * as isly from "isly"
import { EventWithMetadata } from "../../../model"
import { AbstractFilter } from "../AbstractFilter"
import { Configuration } from "../Configuration"
import { Selector } from "./Selector"

export interface Mapping extends Configuration {
	type: "mapping"
	/**
	 * Specify all properties of the mapped object.
	 */
	mapping: [
		// The real type is Selector, rest is for type-prediction in IDE
		(
			| keyof EventWithMetadata
			| `cloudflare.${keyof Required<EventWithMetadata>["cloudflare"]}`
			| (Selector & Record<never, never>)
		),
		Selector
	][]
}
export namespace Mapping {
	export const type = Configuration.type.extend<Mapping>(
		{
			type: isly.string("mapping"),
			mapping: isly.array(isly.tuple(Selector.type, Selector.type)),
		},
		"Mapping.Logger"
	)

	export class Implementation extends AbstractFilter<Mapping> {
		filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined {
			return this.filterConfiguration.mapping.reduce(
				(object, [getSelector, setSelector]) => Selector.set(object, setSelector, Selector.get(event, getSelector)),
				{}
			)
		}
	}
}
