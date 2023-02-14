import * as gracely from "gracely"
import * as storage from "cloudly-storage"
import { Client } from "cloudly-storage/dist/DurableObject/Client"
import * as model from "../../model"
import { BucketStorage as BStorage } from "./Storage"

/**
 * A bucket is a durable object-backed container for events
 * selected for a specific listener.
 */
export class Bucket {
	private storageClient: Record<string, Client<gracely.Error> | undefined> = {}
	private constructor(private readonly backend: storage.DurableObject.Namespace<gracely.Error>) {}

	private getStorageClient(listenerName: string) {
		return (this.storageClient[listenerName] ??= this.backend.open(listenerName))
	}

	async append(listener: string, events: model.EventWithMetadata[]): Promise<model.Batch | gracely.Error> {
		return this.getStorageClient(listener).post<model.Batch>("/bucket", events)
	}

	// async list(listenerName: string): Promise<model.Action[] | gracely.Error> {
	// 	return this.getStorageClient(listenerName).get<model.Action[]>("/bucket")
	// }

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
