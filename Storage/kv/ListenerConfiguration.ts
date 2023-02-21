import * as isoly from "isoly"
import * as storage from "cloudly-storage"
import { Listener } from "service/Listener"

export class ListenerConfiguration {
	private constructor(
		private readonly backend: storage.KeyValueStore<
			Listener.ListenerConfiguration,
			{ created: isoly.DateTime; updated?: isoly.DateTime }
		>
	) {}

	async fetch(
		name: string
	): Promise<{ value: Listener.ListenerConfiguration; meta?: { created: string; updated?: string } } | undefined> {
		return await this.backend.get(name)
	}
	async create(listenerConfiguration: Listener.ListenerConfiguration): Promise<void> {
		const { meta: oldMetadata } = (await this.backend.get(listenerConfiguration.name)) ?? { meta: undefined }
		const newMetadata = oldMetadata?.created
			? { created: oldMetadata?.created, updated: new Date().toISOString() }
			: { created: new Date().toISOString() }
		return await this.backend.set(listenerConfiguration.name, listenerConfiguration, { meta: newMetadata })
	}
	async listKeys(): Promise<string[]> {
		return (await this.backend.list({ values: false })).map(item => item.key)
	}
	async listValues(): Promise<Listener.ListenerConfiguration[]> {
		return (await this.backend.list({ values: true })).map(item => item.value).flatMap(item => (item ? item : []))
	}

	static open(kvNamespace: KVNamespace): ListenerConfiguration | undefined {
		const backend = storage.KeyValueStore.Json.create(kvNamespace)
		return backend ? new ListenerConfiguration(backend) : undefined
	}
}
