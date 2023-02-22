import * as gracely from "gracely"
import type { Context } from "Context"
import { Listener } from "service/Listener"

type FetchResult = {
	configuration: Listener.Configuration
	status: string
} & Partial<Listener.Configuration.Metadata>

type CreateResult = FetchResult & { setup: Listener.SetupResult }

type ListKeysResult = string[]

export class ListenerController {
	constructor(
		protected readonly listenerConfigurationStorage: Context.ListenerConfiguration,
		protected readonly bucketStorage: Context.Bucket
	) {}

	public async create(listenerConfiguration: Listener.Configuration) {
		let result: CreateResult | gracely.Error
		const setupResult = await Listener.create(listenerConfiguration).setup()
		breakHere: if (gracely.Error.is(setupResult)) {
			result = setupResult
		} else {
			if (setupResult.success) {
				await this.listenerConfigurationStorage.create(listenerConfiguration)
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
	public async fetch(name: string): Promise<FetchResult | undefined> {
		let result: FetchResult | undefined
		const listenerConfiguration = await this.listenerConfigurationStorage.fetch(name, true)
		if (!listenerConfiguration) {
			result = undefined
		} else {
			result = {
				configuration: Listener.create(listenerConfiguration.value).getConfiguration(),
				...listenerConfiguration.meta,
				status: "Not implemented",
			}
		}
		return result
	}
	public async listKeys(): Promise<ListKeysResult> {
		return await this.listenerConfigurationStorage.listKeys()
	}
}
