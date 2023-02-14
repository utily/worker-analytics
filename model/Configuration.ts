import * as isly from "isly"
import { ListenerConfiguration } from "./ListenerConfiguration"

export interface Configuration {
	listeners: ListenerConfiguration[]
}

export namespace Configuration {
	export const type = isly.object<Configuration>({
		listeners: isly.array(ListenerConfiguration.type),
	})
	export const is = type.is
	export const flaw = type.flaw
}
