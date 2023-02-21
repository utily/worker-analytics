import * as gracely from "gracely"
import * as isly from "isly"
import { EventWithMetadata } from "../../../model"
import { PrivateKey } from "../../../model/PrivateKey"
import { AbstractListener } from "../AbstractListener"
import { Configuration } from "../Configuration"
import { BigQueryApi } from "./BigQueryApi"

// https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll

// https://developers.google.com/identity/protocols/oauth2/service-account
// https://developers.google.com/identity/protocols/oauth2/service-account#jwt-auth
// https://docs.openbridge.com/en/articles/1856793-how-to-set-up-google-bigquery-creating-and-configuring-service-accounts-in-google-cloud-console

// https://github.com/sagi/workers-jwt/tree/master/src
// https://www.npmjs.com/package/@sagi.io/workers-jwt

// https://github.com/defog-ai/cloud-workers-bigquery-ingest

// https://github.com/pax2pay/model-cde/blob/master/Proxy/Selector.ts

export interface BigQuery extends Configuration {
	type: "big-query"
	privateKey: PrivateKey
	projectName: string
	datasetName: string
	tableName: string
	tableSchema: BigQueryApi.TableSchemaColumn[]
}

export namespace BigQuery {
	export const type = Configuration.type.extend<BigQuery>(
		{
			type: isly.string("big-query"),
			privateKey: PrivateKey.type,
			projectName: isly.string(),
			datasetName: isly.string(),
			tableName: isly.string(),
			tableSchema: isly.array(BigQueryApi.TableSchemaColumn.type),
		},
		"Listener.BigQuery"
	)

	export class Implementation extends AbstractListener<BigQuery> {
		async setup(oldConfiguration?: BigQuery): Promise<true | gracely.Error> {
			const response = await this.getStatus()
			return response
		}
		protected token: any

		getConfiguration() {
			return { ...this.configuration, privateKey: { ...this.configuration.privateKey, private_key: "********" } }
		}

		protected getToken() {
			return this.token
		}
		async getStatus(): Promise<gracely.Error> {
			const bigQueryApi = new BigQueryApi(this.configuration)
			let result: any
			const table = await bigQueryApi.getTable()
			if (BigQueryApi.TableResponse.type.is(table)) {
				const allFieldsExists = this.configuration.tableSchema.every(field =>
					table.schema.fields.some(existingField =>
						(["name", "type", "mode"] as const).every(
							property => !field[property] || existingField[property] == field[property]
						)
					)
				)
				if (!allFieldsExists) {
					result = table
				} else {
					result = await bigQueryApi.patchTable()
				}
			} else {
				console.error("Couldn't fetch information about table.")
				result = await bigQueryApi.createTable()
			}
			return result
		}

		async processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]> {
			const bigQueryApi = new BigQueryApi(this.configuration)
			const response = await bigQueryApi.insertAll(
				batch.map((event, index) => ({
					// https://cloud.google.com/bigquery/docs/streaming-data-into-bigquery#dataconsistency
					insertId: (event as any)["created"] + index,
					json: event,
				}))
			)
			console.log(response)
			return batch.map(event => true)
			// throw new Error("Method not implemented.")
		}
	}
}
