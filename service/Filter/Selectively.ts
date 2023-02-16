import { selectively } from "selectively"
import * as isly from "isly"
import { EventWithMetadata } from "../../model"
import { AbstractFilter } from "./AbstractFilter"
import { Configuration } from "./Configuration"
export interface Selectively extends Configuration {
	type: "selectively"
	expression: string
}
export namespace Selectively {
	export const type = Configuration.type.extend<Selectively>(
		{
			type: isly.string("selectively"),
			expression: isly.string(),
		},
		"Filter.Selectively"
	)

	export class Implementation extends AbstractFilter<Selectively> {
		protected selectivelyFilter: selectively.Rule

		constructor(filterConfiguration: Selectively) {
			super(filterConfiguration)
			this.selectivelyFilter = selectively.parse(this.filterConfiguration.expression)
		}

		filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined {
			return this.selectivelyFilter.is(event) ? event : undefined
		}
	}
}
