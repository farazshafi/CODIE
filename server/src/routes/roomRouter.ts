import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createRoomSchema } from "../validation/roomValidation";
import { authenticate } from "../middlewares/authenticate";
import { roomController } from "../container";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, validate(createRoomSchema), roomController.createRoom)
roomRouter.get("/get_room/:projectId", authenticate, roomController.getRoomByProjectId)

export default roomRouter