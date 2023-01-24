import * as selectively from "selectively"
import { Environment } from "../Environment"

export interface Configuration {
	listeners: Record<string, selectively.Rule>
}
// TODO replace with KV
const dummy = {
	listeners: {
		all: selectively.parse(""),
		others: selectively.parse(""),
	},
} /* satisfies */ as Configuration

export namespace Configuration {
	export async function load(environment: Environment): Promise<Configuration | undefined> {
		return dummy
	}
}
