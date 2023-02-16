import * as isly from "isly"
import { EventWithMetadata } from "../../../model"
import { AbstractFilter } from "../AbstractFilter"
import { Configuration } from "../Configuration"
import { Selector } from "./Selector"

export interface Mapping extends Configuration {
	type: "mapping"
	mapping: [Selector, Selector][]
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
