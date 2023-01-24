import * as gracely from "gracely"
import * as storage from "cloudly-storage"
import { Client } from "cloudly-storage/dist/DurableObject/Client"
import * as model from "../../model"
import { ActionStorage as EStorage } from "./Storage"

export class Actions {
	private storageClient: Record<string, Client<gracely.Error> | undefined> = {}
	private constructor(private readonly backend: storage.DurableObject.Namespace<gracely.Error>) {}

	async create(listener: string, actions: model.Action[]): Promise<model.Action[] | gracely.Error> {
		// TODO:
		// Create a new Durable Object with random name if it not exists?
		return (this.storageClient[listener] ??= this.backend.open(listener)).post<model.Action[]>("/actions", actions)
	}

	static open(backend?: DurableObjectNamespace | storage.DurableObject.Namespace): Actions | undefined {
		if (!storage.DurableObject.Namespace.is(backend))
			backend = storage.DurableObject.Namespace.open(backend)
		return backend ? new Actions(backend) : undefined
	}
}
export namespace Actions {
	export const Storage = EStorage
	export type Storage = EStorage
}
