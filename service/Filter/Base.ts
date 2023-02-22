import * as isly from "isly"
import { EventWithMetadata } from "../../model"

export abstract class BaseFilter<C extends BaseFilter.Configuration = BaseFilter.Configuration> {
	constructor(protected readonly filterConfiguration: C) {}

	abstract filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined
}

export namespace BaseFilter {
	export interface Configuration {
		comment?: string
	}
	export namespace Configuration {
		export const type = isly.object<Configuration>(
			{
				comment: isly.optional(isly.string()),
			},
			"FilterConfiguration"
		)
	}
}
