import * as gracely from "gracely"
import * as storage from "cloudly-storage"
import * as model from "../../model"
import { EventStorage as EStorage } from "./Storage"

export class Events {
	private constructor(private readonly backend: storage.DurableObject.Namespace<gracely.Error>) {}

	async create(events: model.Event[], shard?: number): Promise<model.Event[] | gracely.Error> {
		const storageClient = this.backend.open("event" + (shard ?? ""))
		return await storageClient.post<model.Event[]>("/events", events)
	}

	static open(backend?: DurableObjectNamespace | storage.DurableObject.Namespace): Events | undefined {
		if (!storage.DurableObject.Namespace.is(backend))
			backend = storage.DurableObject.Namespace.open(backend)
		return backend ? new Events(backend) : undefined
	}
}
export namespace Events {
	export const Storage = EStorage
	export type Storage = EStorage
}