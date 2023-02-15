import * as isly from "isly"

export interface Configuration {
	comment?: string
}
export namespace Configuration {
	export const type = isly.object<Configuration>(
		{
			comment: isly.optional(isly.string()),
		},
		"FilterConfiguration"
	)
}
