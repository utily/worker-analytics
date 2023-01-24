import * as gracely from "gracely"
import * as model from "../../../../model"
import { storageRouter } from "../storageRouter"

storageRouter.alarm = async function (storageContext) {
	// Dynamic import to avoid Circular dependency:
	const { Context } = await import("../../..")
	const workerContext = await Context.load(storageContext.environment)
	if (!workerContext) {
		throw gracely.server.misconfigured("Configuration", "Configuration is missing.")
	}
	const actions = workerContext.actions
	if (gracely.Error.is(actions)) {
		throw actions
	} else {
		const waitingEvents = await storageContext.state.storage.list<model.Event>()
		const buckets: Record<string, model.Action[]> = {}
		const listeners = Object.entries(workerContext.configuration.listeners)
		Array.from(waitingEvents.entries()).forEach(([timestamp, event]) => {
			listeners.forEach(([listener, filter]) => {
				if (filter.is(event)) {
					;(buckets[listener] ??= []).push({
						created: timestamp,
						...event,
					})
				}
			})
		})
		await Promise.all(
			Object.entries(buckets).map(async ([listener, actions]) => {
				if (gracely.Error.is(workerContext.actions)) {
					throw workerContext.actions
				}
				await workerContext.actions.create(listener, actions)
			})
		)
		await storageContext.state.storage.deleteAll()
	}
}
