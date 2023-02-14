import * as isly from "isly"

export interface Base {
	name: string
	/**
	 * A selectively-expression
	 */
	filter: string
	comment?: string
}

export const baseType = isly.object<Base>(
	{
		name: isly.string(/^[a-z0-9_-]+$/),
		filter: isly.string(),
		comment: isly.optional(isly.string()),
	},
	"Listener"
)
