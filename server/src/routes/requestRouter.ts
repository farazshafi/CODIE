import { Router } from "express"
import { authenticate } from "../middlewares/authenticate"
import { requestController } from "../container"

const requestRouter = Router()

requestRouter.get("/get_sended_requests/:id", authenticate, requestController.getAllSendedReq)
requestRouter.get("/get_recived_requests/:id", authenticate, requestController.getAllRecivedRequest)
requestRouter.get("/get_requests_by_room/:roomId", authenticate, requestController.getRequetsByRoom)

export default requestRouter