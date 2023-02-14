import * as isly from "isly"
import { Base, baseType } from "./Base"

export interface Http extends Base {
	type: "http"
	/**
	 * Url
	 */
	target: string
}
export namespace Http {
	export const type = baseType.extend<Http>(
		{
			type: isly.string("http"),
			target: isly.string(),
		},
		"Listener.Http"
	)
	export const is = type.is
	export const flaw = type.flaw
}
