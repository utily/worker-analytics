import * as isly from "isly"
import { BaseFilter } from "./Base"
import { Mapping } from "./Mapping"
import { Selectively } from "./Selectively"

type Implementations = {
	[Type in Filter.Configuration["type"]]: {
		// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
		new (configuration: Filter.Configuration & { type: Type }): BaseFilter<Filter.Configuration & { type: Type }>
	}
}

const implementations: Implementations = {
	// List all implementations here:
	selectively: Selectively.Implementation,
	mapping: Mapping.Implementation,
}

export namespace Filter {
	export function create<C extends Configuration>(filterConfiguration: C) {
		return new implementations[filterConfiguration.type](filterConfiguration as any) as BaseFilter<C>
	}
	export function createList(filter: Configuration[]) {
		return filter.map(filterConfiguration => create(filterConfiguration))
	}

	export type Configuration = Selectively | Mapping
	export const Configuration = isly.union(Selectively.type, Mapping.type)
}
