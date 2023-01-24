import * as cloudlyRouter from "cloudly-router"
import { Storage } from "../../Storage"
import { ActionStorage } from "."

export const storageRouter: Storage.Router<ActionStorage> = {
	router: new cloudlyRouter.Router(),
}
