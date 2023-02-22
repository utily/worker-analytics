import * as http from "cloudly-http"
import type { Context } from "Context"
import * as model from "model"

export class EventController {
	constructor(protected readonly eventsStorage: Context.Events, protected readonly context: Context) {}

	public async addEvent(event: model.Event) {
		this.addEvents([event])
	}
	public async addEvents(events: model.Event[]) {
		return this.addBatch({
			events,
			cloudflare: this.context.cloudflareProperties,
			header: this.context.request?.header ?? {},
		})
	}
	public async addBatch(batch: model.Batch) {
		return await this.eventsStorage.addBatch(batch)
	}
}
