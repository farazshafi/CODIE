import { Router } from "express";
import { validate } from "../middlewares/validate";
import { checkPermissionSchema, createRoomSchema, updateRoleSchema } from "../validation/roomValidation";
import { authenticate } from "../middlewares/authenticate";
import { roomController } from "../container";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, validate(createRoomSchema), roomController.createRoom)
roomRouter.get("/get_room/:projectId", authenticate, roomController.getRoomByProjectId)
roomRouter.get("/get_contributers/:projectId", authenticate, roomController.getContributers)
roomRouter.post("/update_role", authenticate, validate(updateRoleSchema), roomController.updateRole)
roomRouter.post("/ceck_permission_to_edit", authenticate, validate(checkPermissionSchema), roomController.checkPermission)

export default roomRouter