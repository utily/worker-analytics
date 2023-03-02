import * as gracely from "gracely"
import * as storage from "cloudly-storage"
import { Client } from "cloudly-storage/dist/DurableObject/Client"
import * as model from "model"
import { HasUuid } from "model/HasUuid"
import { Listener } from "service/Listener"
import { BucketStorage as BStorage } from "./Storage"

/**
 * A bucket is a durable object-backed container for events
 * selected for a specific listener.
 */
export class Bucket {
	private storageClient: Record<string, Client<gracely.Error> | undefined> = {}
	private constructor(private readonly backend: storage.DurableObject.Namespace<gracely.Error>) {}

	async addEvents(
		listenerConfiguration: Listener.Configuration,
		events: HasUuid[]
	): Promise<model.Batch | gracely.Error> {
		return (await this.getStorageClient(listenerConfiguration)).post<model.Batch>("/events", events)
	}

	private async getStorageClient(listenerConfiguration: Listener.Configuration): Promise<Client<gracely.Error>> {
		let result = this.storageClient[listenerConfiguration.name]
		if (!result) {
			result = this.backend.open(listenerConfiguration.name)
			await result.post<Listener.Configuration>("/configuration", listenerConfiguration)
		}
		return result
	}

	static open(backend?: DurableObjectNamespace | storage.DurableObject.Namespace): Bucket | undefined {
		if (!storage.DurableObject.Namespace.is(backend))
			backend = storage.DurableObject.Namespace.open(backend)
		return backend ? new Bucket(backend) : undefined
	}
}
export namespace Bucket {
	export const Storage = BStorage
	export type Storage = BStorage
}
