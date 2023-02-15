import { AbstractListener } from "./AbstractListener"
import { BigQuery } from "./BigQuery"
import { Http } from "./Http"
import { ListenerConfiguration } from "./ListenerConfiguration"
import { Logger } from "./Logger"

type Implementations = {
	[Type in ListenerConfiguration["type"]]: {
		// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
		new (configuration: ListenerConfiguration & { type: Type }): AbstractListener<
			ListenerConfiguration & { type: Type }
		>
	}
}

// type Implementations = Record<
// 	ListenerConfiguration["type"],
// 	// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
// 	{ new (configuration: ListenerConfiguration): AbstractListener }
// >

const implementations: Implementations = {
	// List all implementations her:
	"big-query": BigQuery.Implementation,
	http: Http.Implementation,
	logger: Logger.Implementation,
}

export namespace Listener {
	export function create<C extends ListenerConfiguration>(listenerConfiguration: C) {
		return new implementations[listenerConfiguration.type](listenerConfiguration as any) as AbstractListener<C>
	}
}
