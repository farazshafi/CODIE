import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createRoomSchema, updateRoleSchema } from "../validation/roomValidation";
import { authenticate } from "../middlewares/authenticate";
import { roomController } from "../container";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, validate(createRoomSchema), roomController.createRoom)
roomRouter.get("/get_room/:projectId", authenticate, roomController.getRoomByProjectId)
roomRouter.post("/update_role", authenticate, validate(updateRoleSchema), roomController.updateRole)

export default roomRouter