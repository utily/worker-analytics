import * as storage from "cloudly-storage"
import { Listener } from "service/Listener"

export class ListenerConfiguration {
	private constructor(
		private readonly backend: storage.KeyValueStore<Listener.Configuration, Listener.Configuration.Metadata>
	) {}

	async fetch(
		name: string,
		includeMetadata: true
	): Promise<{ value: Listener.Configuration; meta?: Listener.Configuration.Metadata } | undefined>
	async fetch(name: string, includeMetadata?: false): Promise<Listener.Configuration | undefined>
	async fetch(
		name: string,
		includeMetadata?: boolean
	): Promise<
		{ value: Listener.Configuration; meta?: Listener.Configuration.Metadata } | Listener.Configuration | undefined
	> {
		const valueWithMetadata = await this.backend.get(name)
		return valueWithMetadata && (includeMetadata ? valueWithMetadata : valueWithMetadata.value)
	}

	async remove(name: string): Promise<boolean> {
		return (await this.fetch(name).then(Boolean)) && (await this.backend.set(name).then(() => true))
	}

	async create(listenerConfiguration: Listener.Configuration): Promise<void> {
		const { meta: oldMetadata } = (await this.backend.get(listenerConfiguration.name)) ?? { meta: undefined }
		const newMetadata: Listener.Configuration.Metadata = oldMetadata?.created
			? { created: oldMetadata?.created, updated: new Date().toISOString() }
			: { created: new Date().toISOString() }
		return await this.backend.set(listenerConfiguration.name, listenerConfiguration, { meta: newMetadata })
	}

	async listKeys(): Promise<string[]> {
		return (await this.backend.list({ values: false })).map(item => item.key)
	}

	async listValues(): Promise<Listener.Configuration[]> {
		return (await this.backend.list({ values: true })).map(item => item.value).flatMap(item => (item ? item : []))
	}

	static open(kvNamespace: KVNamespace): ListenerConfiguration | undefined {
		const backend = storage.KeyValueStore.Json.create(kvNamespace)
		return backend ? new ListenerConfiguration(backend) : undefined
	}
}
