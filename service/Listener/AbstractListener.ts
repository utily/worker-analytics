import * as gracely from "gracely"
import { EventWithMetadata } from "../../model"
import type { ListenerConfiguration } from "./ListenerConfiguration"

export abstract class AbstractListener<C extends ListenerConfiguration> {
	constructor(protected readonly configuration: C) {}
	/**
	 * Returns configuration, used by REST-API when returning the configuration.
	 *
	 * Override to protected sensitive data. (Eg passwords)
	 */
	getConfiguration(): C {
		return this.configuration
	}
	/**
	 * This is called when the listener i configured, or reconfigured.
	 */
	abstract setup(oldConfiguration?: C): Promise<AbstractListener.SetupResult | gracely.Error>

	abstract processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]>
}

export namespace AbstractListener {
	export type SetupResult = { success: boolean; details?: (string | gracely.Error)[] }
}
