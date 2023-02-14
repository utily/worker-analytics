import { Batch, ListenerConfiguration } from "../../model"
import { BigQuery } from "./BigQuery"
import { Http } from "./Http"

export interface Listener {
	processBatch(batch: Batch[]): Promise<boolean[]>
}

const implementations: Record<
	ListenerConfiguration["type"],
	// About constructor-signature: https://stackoverflow.com/a/13408029/1003172
	{
		new (configuration: ListenerConfiguration): Listener
	}
> = {
	// List all implementations her:
	"big-query": BigQuery,
	http: Http,
}

export namespace Listener {
	export const create = (listenerConfiguration: ListenerConfiguration): Listener => {
		return new implementations[listenerConfiguration.type](listenerConfiguration)
	}
}
