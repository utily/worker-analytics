import * as isly from "isly"
import { Base } from "./Base"
import { BigQuery } from "./BigQuery"
import { Http } from "./Http"
import { Logger } from "./Logger"

type Implementations = {
	[Type in Listener.ListenerConfiguration["type"]]: {
		// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
		new (configuration: Listener.ListenerConfiguration & { type: Type }): Base<
			Listener.ListenerConfiguration & { type: Type }
		>
	}
}

const implementations: Implementations = {
	// List all implementations her:
	"big-query": BigQuery.Implementation,
	http: Http.Implementation,
	logger: Logger.Implementation,
}

export namespace Listener {
	export function create<C extends ListenerConfiguration>(listenerConfiguration: C) {
		return new implementations[listenerConfiguration.type](listenerConfiguration as any) as Base<C>
	}

	export type ListenerConfiguration = Logger | Http | BigQuery

	export namespace ListenerConfiguration {
		export const type = isly.union(Logger.type, Http.type, BigQuery.type)
		export const is = type.is
		export const flaw = type.flaw
	}
}
