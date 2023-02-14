import { Batch } from "../../model"
import type { Listener } from "."
// export interface Http extends Base {
// 	type: "http"
// 	/**
// 	 * Url
// 	 */
// 	target: string
// }
// export namespace Http {
// 	export const type = baseType.extend<Http>(
// 		{
// 			type: isly.string("http"),
// 			target: isly.string(),
// 		},
// 		"Listener.Http"
// 	)
// 	export const is = type.is
// 	export const flaw = type.flaw
// }

export class Http implements Listener {
	processBatch(batch: Batch[]): Promise<boolean[]> {
		throw new Error("Method not implemented.")
	}
}
