import * as gracely from "gracely"
import type { InsertRowsOptions, TableField, TableMetadata } from "@google-cloud/bigquery"
import { getTokenFromGCPServiceAccount } from "@sagi.io/workers-jwt"
import { http, Response } from "cloudly-http"
import * as isly from "isly"
import type { BigQuery as BigQueryConfiguration } from "."

export class BigQueryApi {
	constructor(protected readonly listenerConfiguration: BigQueryConfiguration) {}
	protected token: string | undefined

	protected async getToken() {
		return (this.token ??= await getTokenFromGCPServiceAccount({
			serviceAccountJSON: this.listenerConfiguration.privateKey,
			aud: "https://bigquery.googleapis.com/",
		}))
	}

	/**
	 * https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll
	 */
	async insertAll(rows: InsertRowsOptions["rows"]) {
		const { projectName: projectName, datasetName: datasetName, tableName } = this.listenerConfiguration
		const insertUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectName}/datasets/${datasetName}/tables/${tableName}/insertAll`

		const payload: InsertRowsOptions = {
			kind: "bigquery#tableDataInsertAllResponse",
			rows,
		}
		// console.log(JSON.stringify(payload, null, 2))
		const bqResp = await http.fetch({
			url: insertUrl,
			method: "POST",
			body: JSON.stringify(payload),
			header: {
				"content-type": "application/json;charset=UTF-8",
				authorization: "Bearer " + (await this.getToken()),
			},
		})
		return bqResp
	}
	/**
	 * https://cloud.google.com/bigquery/docs/reference/rest/v2/tables/insert
	 */
	async createTable(): Promise<BigQueryApi.TableResponse | gracely.Error> {
		const { projectName, datasetName, tableName } = this.listenerConfiguration
		const createUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectName}/datasets/${datasetName}/tables`
		const payload: TableMetadata = {
			tableReference: {
				projectId: projectName,
				datasetId: datasetName,
				tableId: tableName,
			},
			schema: {
				fields: this.listenerConfiguration.tableSchema,
			},
		}
		const response = await http.fetch({
			url: createUrl,
			method: "POST",
			body: JSON.stringify(payload),
			header: {
				"content-type": "application/json;charset=UTF-8",
				authorization: "Bearer " + (await this.getToken()),
			},
		})
		const body = await response.body
		let result: BigQueryApi.TableResponse | gracely.Error
		if (response.status == 200 && BigQueryApi.TableResponse.type.is(body)) {
			result = body
		} else {
			result = gracely.server.backendFailure("bigquery.googleapis.com", body)
		}
		return result
	}
	/**
	 * https://cloud.google.com/bigquery/docs/reference/rest/v2/tables/patch
	 */
	async patchTable(): Promise<BigQueryApi.TableResponse | gracely.Error> {
		const { projectName, datasetName, tableName } = this.listenerConfiguration
		const patchUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectName}/datasets/${datasetName}/tables/${tableName}`
		const payload: TableMetadata = {
			tableReference: {
				projectId: projectName,
				datasetId: datasetName,
				tableId: tableName,
			},
			schema: {
				fields: this.listenerConfiguration.tableSchema,
			},
		}
		const response = await http.fetch({
			url: patchUrl,
			method: "PATCH",
			body: JSON.stringify(payload),
			header: {
				"content-type": "application/json;charset=UTF-8",
				authorization: "Bearer " + (await this.getToken()),
			},
		})
		const body = await response.body
		let result: BigQueryApi.TableResponse | gracely.Error
		if (response.status == 200 && BigQueryApi.TableResponse.type.is(body)) {
			result = body
		} else {
			result = gracely.server.backendFailure("bigquery.googleapis.com", body)
		}
		return result
	}

	/**
	 * https://cloud.google.com/bigquery/docs/reference/rest/v2/tables/get
	 */
	async getTable(view: "BASIC" | "STORAGE_STATS" | "FULL" = "BASIC"): Promise<BigQueryApi.TableResponse | undefined> {
		const { projectName, datasetName, tableName } = this.listenerConfiguration
		const tableInfoUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectName}/datasets/${datasetName}/tables/${tableName}?view=${view}`
		const response: Response = await http.fetch({
			url: tableInfoUrl,
			method: "GET",
			header: {
				authorization: "Bearer " + (await this.getToken()),
			},
		})
		let result: BigQueryApi.TableResponse | undefined
		const body = await response.body
		if (response.status == 200 && BigQueryApi.TableResponse.type.is(body)) {
			result = body
		} else {
			result = undefined // response
		}
		return result
	}
}

export namespace BigQueryApi {
	export type TableSchemaColumn = TableField & {
		name: string
		type: typeof TableSchemaColumn.typeValues[number]
		mode?: typeof TableSchemaColumn.modeValues[number]
	}

	export namespace TableSchemaColumn {
		export const typeValues = [
			"STRING",
			"BYTES",
			"INTEGER",
			// (same as INTEGER)
			"INT64",
			"FLOAT",
			// (same as FLOAT)
			"FLOAT64",
			"NUMERIC",
			"BIGNUMERIC",
			"BOOLEAN",
			// (same as BOOLEAN)
			"BOOL",
			"TIMESTAMP",
			"DATE",
			"TIME",
			"DATETIME",
			"INTERVAL",
			// (where RECORD indicates that the field contains a nested schema)
			"RECORD",
			// (same as RECORD)
			"STRUCT",
		] as const
		export const modeValues = ["NULLABLE", "REQUIRED", "REPEATED"] as const
		export const type: isly.Type<TableSchemaColumn> = isly.object({
			name: isly.string(/^[a-zA-Z_][a-zA-Z0-9_]{0,299}$/),
			type: isly.string(typeValues),
			mode: isly.optional(isly.string(modeValues)),
			categories: isly.optional(
				isly.object({
					names: isly.optional(isly.array(isly.string(), { criteria: "maxLength", value: 5 })),
				})
			),
			collationSpec: isly.optional(isly.string()),
			description: isly.optional(isly.string(/* TODO: MaxLength 1024 */)),
			fields: isly.optional(isly.array(isly.lazy(() => type))),
			maxLength: isly.optional(isly.string()),
			policyTags: isly.optional(
				isly.object({
					names: isly.optional(isly.array(isly.string(), { criteria: "maxLength", value: 1 })),
				})
			),
			precision: isly.optional(isly.string()),
			scale: isly.optional(isly.string()),
		})
	}
	export type TableResponse = {
		kind: "bigquery#table"
		schema: {
			fields: TableSchemaColumn[]
		}
	}
	export namespace TableResponse {
		export const type = isly.object<TableResponse>({
			kind: isly.string("bigquery#table"),
			schema: isly.object({ fields: isly.array(TableSchemaColumn.type) }),
		})
	}
}
