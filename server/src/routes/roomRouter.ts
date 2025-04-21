import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createRoomSchema } from "../validation/roomValidation";
import { createRoom } from "../controllers/roomController";
import { authenticate } from "../middlewares/authenticate";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, validate(createRoomSchema), createRoom)

export default roomRouter