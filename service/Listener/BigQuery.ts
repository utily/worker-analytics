import { Batch } from "../../model"
import type { Listener } from "."

// https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll

// https://developers.google.com/identity/protocols/oauth2/service-account
// https://developers.google.com/identity/protocols/oauth2/service-account#jwt-auth

// https://github.com/sagi/workers-jwt/tree/master/src
// https://www.npmjs.com/package/@sagi.io/workers-jwt

// https://github.com/pax2pay/model-cde/blob/master/Proxy/Selector.ts

// export interface BigQuery extends Base {
// 	type: "big-query"
// 	connection: string
// 	/**
// 	 * JSONPath?
// 	 */
// 	mapping: Record<string /* tableName */, Record<string, string>>
// }
// export namespace BigQuery {
// 	export const type = baseType.extend<BigQuery>(
// 		{
// 			type: isly.string("big-query"),
// 			connection: isly.string(),
// 			/**
// 			 * TODO: fix!
// 			 */
// 			mapping: isly.any(),
// 		},
// 		"Listener.BigQuery"
// 	)
// 	export const is = type.is
// 	export const flaw = type.flaw
// }

export class BigQuery implements Listener {
	processBatch(batch: Batch[]): Promise<boolean[]> {
		console.log(batch)
		throw new Error("Method not implemented.")
	}
}
