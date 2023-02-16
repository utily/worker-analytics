import * as isly from "isly"
import { Batch, EventWithMetadata } from "../../model"
import { PrivateKey } from "../../model/PrivateKey"
import { AbstractListener } from "./AbstractListener"
import { Configuration } from "./Configuration"

// https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll

// https://developers.google.com/identity/protocols/oauth2/service-account
// https://developers.google.com/identity/protocols/oauth2/service-account#jwt-auth

// https://github.com/sagi/workers-jwt/tree/master/src
// https://www.npmjs.com/package/@sagi.io/workers-jwt

// https://github.com/pax2pay/model-cde/blob/master/Proxy/Selector.ts

export interface BigQuery extends Configuration {
	type: "big-query"
	privateKey: PrivateKey

	/**
	 * JSONPath?
	 */
	mapping?: Record<string /* tableName */, Record<string, string>>
}
export namespace BigQuery {
	export const type = Configuration.type.extend<BigQuery>(
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
	export class Implementation extends AbstractListener<BigQuery> {
		processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			console.log(batch)
			throw new Error("Method not implemented.")
		}
	}
}
