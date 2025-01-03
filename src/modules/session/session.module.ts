import {SessionService} from "./session.service"
import {SessionController} from "./session.controller"

const sessionService = new SessionService()
const sessionController = new SessionController(sessionService)

export { sessionService, sessionController}