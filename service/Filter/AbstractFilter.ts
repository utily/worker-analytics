import { EventWithMetadata } from "../../model"
import type { FilterConfiguration } from "./FilterConfiguration"

export abstract class AbstractFilter<C extends FilterConfiguration = FilterConfiguration> {
	constructor(protected readonly filterConfiguration: C) {}

	abstract filter(event: EventWithMetadata | object): EventWithMetadata | object | undefined
}
