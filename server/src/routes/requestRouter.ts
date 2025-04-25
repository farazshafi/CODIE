import { Router } from "express"
import { authenticate } from "../middlewares/authenticate"
import { getAllRecivedRequest, getAllSendedReq, } from "../controllers/requestController"

const requestRouter = Router()

requestRouter.get("/get_sended_requests/:id", authenticate, getAllSendedReq)
requestRouter.get("/get_recived_requests/:id", authenticate, getAllRecivedRequest)

export default requestRouter