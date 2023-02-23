import { Analytics } from "Analytics"
import * as isly from "isly"
import { Environment } from "../Environment"

export interface Configuration {
	analytics: Analytics.Configuration
}

const config: Configuration = {
	analytics: {
		endpoint: "http://localhost:8788",
	},
}

export namespace Configuration {
	export const type = isly.object<Configuration>(
		{
			analytics: Analytics.Configuration.type,
		},
		"Configuration"
	)
	export const is = type.is
	export const flaw = type.flaw

	export async function load(environment: Environment): Promise<Configuration | undefined> {
		let result: Configuration | undefined
		const configuration: Configuration = config
		if (is(configuration))
			result = configuration
		else
			console.error(JSON.stringify(flaw(configuration), null, 2))

		return result
	}
}
