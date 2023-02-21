import * as isly from "isly"
import { Mapping } from "./Mapping"
import { Selectively } from "./Selectively"

export type FilterConfiguration = Selectively | Mapping

export const FilterConfiguration = isly.union(Selectively.type, Mapping)
