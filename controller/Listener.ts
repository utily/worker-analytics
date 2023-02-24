import * as gracely from "gracely"
import type { Context } from "Context"
import { Listener } from "service/Listener"
import { BaseListener } from "service/Listener/Base"

type FetchResult = {
	configuration: Listener.Configuration
	status: BaseListener.StatusResult
} & Partial<Listener.Configuration.Metadata>

type CreateResult = FetchResult & { setup: Listener.SetupResult }

type ListKeysResult = string[]

type RemoveResult = boolean

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
			const listener = Listener.create(listenerConfiguration.value)
			result = {
				configuration: listener.getConfiguration(),
				...listenerConfiguration.meta,
				status: await listener.getStatus(),
			}
		}
		return result
	}
	public async remove(name: string): Promise<RemoveResult | undefined> {
		return await this.listenerConfigurationStorage.remove(name)
		// TODO: Remove bucket
	}
	public async listKeys(): Promise<ListKeysResult> {
		return await this.listenerConfigurationStorage.listKeys()
	}
}
