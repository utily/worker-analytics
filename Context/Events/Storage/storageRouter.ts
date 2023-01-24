import * as cloudlyRouter from "cloudly-router"
import { Storage } from "../../Storage"
import { EventStorage as EventStorage } from "."

export const storageRouter: Storage.Router<EventStorage> = {
	router: new cloudlyRouter.Router(),
}
