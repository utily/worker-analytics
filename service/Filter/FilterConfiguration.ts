import * as isly from "isly"
import { Mapping } from "./Mapping"
import { Selectively } from "./Selectively"

export type FilterConfiguration = Selectively | Mapping

export namespace FilterConfiguration {
	export const type = isly.union(Selectively.type, Mapping.type)
	export const is = type.is
	export const flaw = type.flaw
}
