import * as isly from "isly"
import { EventWithMetadata } from "../../../model"
import { BaseFilter } from "../Base"
import { Selector } from "./Selector"

type Pair<T> = [T, T]

export interface Mapping extends BaseFilter.Configuration {
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

export namespace Mapping {
	export const type = BaseFilter.Configuration.type.extend<Mapping>(
		{
			type: isly.string("mapping"),
			mapping: isly.array(isly.tuple(Selector.type, Selector.type)),
		},
		"Filter.Mapping"
	)
	export const is = type.is
	export const flaw = type.flaw

	export class Implementation extends BaseFilter<Mapping> {
		filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined {
			return this.filterConfiguration.mapping.reduce(
				(object, [getSelector, setSelector]) => Selector.set(object, setSelector, Selector.get(event, getSelector)),
				{}
			)
		}
	}
}
