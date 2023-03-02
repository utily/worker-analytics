import * as gracely from "gracely"
import * as storage from "cloudly-storage"
import { Listener } from "service/Listener"
import { BaseListener } from "service/Listener/Base"

type FetchResult = {
	configuration: Listener.Configuration
	status: BaseListener.StatusResult
} & Partial<Listener.Configuration.Metadata>

type CreateResult = FetchResult & { setup: Listener.SetupResult }

export class ListenerConfiguration {
	private constructor(
		private readonly backend: storage.KeyValueStore<Listener.Configuration, Listener.Configuration.Metadata>
	) {}

	async create(listenerConfiguration: Listener.Configuration) {
		let result: CreateResult | gracely.Error
		const setupResult = await Listener.create(listenerConfiguration).setup()
		breakHere: if (gracely.Error.is(setupResult)) {
			result = setupResult
		} else {
			if (setupResult.success) {
				await this.saveListenerConfiguration(listenerConfiguration)
				//TODO update config in bucket!
				const fetchResult = await this.fetch(listenerConfiguration.name)
				if (fetchResult) {
					;(setupResult.details ??= []).push("Listenerconfiguration stored in KeyValue-store.")
					result = {
						setup: setupResult,
						...fetchResult,
					}
					break breakHere
				} else {
					setupResult.success = false
					;(setupResult.details ??= []).push("Failed to store listenerconfiguration in KeyValue-store.")
				}
			}
			result = gracely.server.backendFailure(setupResult.details ?? "Setup failed.")
		}
		return result
	}

	async fetch(name: string): Promise<FetchResult | undefined> {
		let result: FetchResult | undefined
		const listenerConfiguration = await this.getListenerConfiguration(name, true)
		if (!listenerConfiguration) {
			result = undefined
		} else {
			const listener = Listener.create(listenerConfiguration.value)
			result = {
				configuration: listener.getConfiguration(),
				...listenerConfiguration.meta,
				status: await listener.getStatus(),
			}
		}
		return result
	}

	async remove(name: string): Promise<boolean> {
		return (await this.getListenerConfiguration(name).then(Boolean)) && (await this.backend.set(name).then(() => true))
	}

	async listKeys(): Promise<string[]> {
		return (await this.backend.list({ values: false })).map(item => item.key)
	}

	async listValues(): Promise<Listener.Configuration[]> {
		return (await this.backend.list({ values: true })).map(item => item.value).flatMap(item => (item ? item : []))
	}

	private async getListenerConfiguration(
		name: string,
		includeMetadata: true
	): Promise<{ value: Listener.Configuration; meta?: Listener.Configuration.Metadata } | undefined>
	private async getListenerConfiguration(
		name: string,
		includeMetadata?: false
	): Promise<Listener.Configuration | undefined>
	private async getListenerConfiguration(
		name: string,
		includeMetadata?: boolean
	): Promise<
		{ value: Listener.Configuration; meta?: Listener.Configuration.Metadata } | Listener.Configuration | undefined
	> {
		const valueWithMetadata = await this.backend.get(name)
		return valueWithMetadata && (includeMetadata ? valueWithMetadata : valueWithMetadata.value)
	}

	private async saveListenerConfiguration(listenerConfiguration: Listener.Configuration): Promise<void> {
		const { meta: oldMetadata } = (await this.backend.get(listenerConfiguration.name)) ?? { meta: undefined }
		const newMetadata: Listener.Configuration.Metadata = oldMetadata?.created
			? { created: oldMetadata?.created, updated: new Date().toISOString() }
			: { created: new Date().toISOString() }
		return await this.backend.set(listenerConfiguration.name, listenerConfiguration, { meta: newMetadata })
	}

	static open(kvNamespace: KVNamespace): ListenerConfiguration | undefined {
		const backend = storage.KeyValueStore.Json.create(kvNamespace)
		return backend ? new ListenerConfiguration(backend) : undefined
	}
}
