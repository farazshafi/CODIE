

import {Router} from "express"
import { validate } from "../middlewares/validate"
import { createInvitationValidation } from "../validation/invitationValidation"
import { invitationController } from "../container"

const invitationRouter = Router()

invitationRouter.post("/create-invitation",validate(createInvitationValidation),invitationController.createInvitation)

export default invitationRouter