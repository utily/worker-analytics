import { EventWithMetadata } from "../../model"
import type { ListenerConfiguration } from "./ListenerConfiguration"

export abstract class AbstractListener<C extends ListenerConfiguration> {
	constructor(protected readonly listenerConfiguration: C) {}

	abstract processBatch(batch: (EventWithMetadata | object)[]): Promise<boolean[]>
}
