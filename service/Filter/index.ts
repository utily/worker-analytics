import { AbstractFilter } from "./AbstractFilter"
import { FilterConfiguration } from "./FilterConfiguration"
import { Mapping } from "./Mapping"
import { Selectively } from "./Selectively"

type Implementations = {
	[Type in FilterConfiguration["type"]]: {
		// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
		new (configuration: FilterConfiguration & { type: Type }): AbstractFilter<FilterConfiguration & { type: Type }>
	}
}

const implementations: Implementations = {
	// List all implementations her:
	selectively: Selectively.Implementation,
	mapping: Mapping.Implementation,
}

export namespace Filter {
	export function create<C extends FilterConfiguration>(filterConfiguration: C) {
		return new implementations[filterConfiguration.type](filterConfiguration as any) as AbstractFilter<C>
	}
	export function createList(filter: FilterConfiguration[]) {
		return filter.map(filterConfiguration => create(filterConfiguration))
	}
}
