

import { Router } from "express"
import { validate } from "../middlewares/validate"
import { createInvitationValidation } from "../validation/invitationValidation"
import { invitationController } from "../container"
import { authenticate } from "../middlewares/authenticate"
import { protect } from "../middlewares/protectMiddleware"

const invitationRouter = Router()

invitationRouter.post("/create-invitation", authenticate, protect, validate(createInvitationValidation), invitationController.createInvitation)
invitationRouter.get("/recived-invitation/:userId", authenticate, protect, invitationController.getRecivedInvitation)

export default invitationRouter