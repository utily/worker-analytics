import * as isly from "isly"
import { PrivateKey } from "../PrivateKey"
import { Base, baseType } from "./Base"

export interface BigQuery extends Base {
	type: "big-query"
	privateKey: PrivateKey

	/**
	 * JSONPath?
	 */
	mapping?: Record<string /* tableName */, Record<string, string>>
}
export namespace BigQuery {
	export const type = baseType.extend<BigQuery>(
		{
			type: isly.string("big-query"),
			privateKey: PrivateKey.type,
			/**
			 * TODO: fix!
			 */
			mapping: isly.optional(isly.any()),
		},
		"Listener.BigQuery"
	)
	export const is = type.is
	export const flaw = type.flaw
}
