import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createRoomSchema } from "../validation/roomValidation";
import { createRoom, getRoomByProjectId } from "../controllers/roomController";
import { authenticate } from "../middlewares/authenticate";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, validate(createRoomSchema), createRoom)
roomRouter.get("/get_room/:projectId", authenticate, getRoomByProjectId)

export default roomRouter