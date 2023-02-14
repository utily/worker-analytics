import * as isly from "isly"
import { BigQuery as ListenerBigQuery } from "./BigQuery"
import { Http as ListenerHttp } from "./Http"

export type ListenerConfiguration = ListenerConfiguration.Http | ListenerConfiguration.BigQuery

export namespace ListenerConfiguration {
	export type Http = ListenerHttp
	export const Http = ListenerHttp

	export type BigQuery = ListenerBigQuery
	export const BigQuery = ListenerBigQuery

	export const type = isly.union(Http.type, BigQuery.type)
	export const is = type.is
	export const flaw = type.flaw
}
