import * as isly from "isly"
import { EventWithMetadata } from "../../../model"
import { AbstractFilter } from "../AbstractFilter"
import { Configuration } from "../Configuration"
import { Selector } from "./Selector"

type Pair<T> = [T, T]

export interface Mapping extends Configuration {
	type: "mapping"
	/**
	 * Specify all properties of the mapped object.
	 * Source is normally EventWithMetadata,
	 * but not if mapping-filters are chained.
	 *
	 * The real type is [Selector, Selector], rest is for type-prediction in IDE
	 */
	mapping: Pair<EventWithMetadata.Selector | (Selector & Record<never, never>)>[]
}

export const Mapping = Configuration.type.extend<Mapping>(
	{
		type: isly.string("mapping"),
		mapping: isly.array(isly.tuple(Selector.type, Selector.type)),
	},
	"Filter.Mapping"
)

// export namespace Mapping {
export class MappingImplementation extends AbstractFilter<Mapping> {
	filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined {
		return this.filterConfiguration.mapping.reduce(
			(object, [getSelector, setSelector]) => Selector.set(object, setSelector, Selector.get(event, getSelector)),
			{}
		)
	}
}
