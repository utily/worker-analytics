import * as isly from "isly"
import { BigQuery } from "./BigQuery"
import { Http } from "./Http"
import { Logger } from "./Logger"

export type ListenerConfiguration = Logger | Http | BigQuery

export namespace ListenerConfiguration {
	export const type = isly.union(Logger.type, Http.type, BigQuery.type)
	export const is = type.is
	export const flaw = type.flaw
}
