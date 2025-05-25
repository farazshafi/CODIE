import { Router } from "express"
import { authenticate } from "../middlewares/authenticate"
import { requestController } from "../container"
import { protect } from "../middlewares/protectMiddleware"

const requestRouter = Router()

requestRouter.get("/get_sended_requests/:id", authenticate,protect, requestController.getAllSendedReq)
requestRouter.get("/get_recived_requests/:id", authenticate,protect, requestController.getAllRecivedRequest)
requestRouter.get("/get_requests_by_room/:roomId", authenticate,protect, requestController.getRequetsByRoom)

export default requestRouter