import { Router } from "express";
import { validate } from "../middlewares/validate";
import { checkPermissionSchema, createRoomSchema, remove_from_project_Schema, updateRoleSchema } from "../validation/roomValidation";
import { authenticate } from "../middlewares/authenticate";
import { roomController } from "../container";
import { protect } from "../middlewares/protectMiddleware";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, protect, validate(createRoomSchema), roomController.createRoom)
roomRouter.get("/get_room/:projectId", authenticate, protect, roomController.getRoomByProjectId)
roomRouter.get("/get_contributers/:projectId", authenticate, protect, roomController.getContributers)
roomRouter.post("/update_role", authenticate, protect, validate(updateRoleSchema), roomController.updateRole)
roomRouter.post("/ceck_permission_to_edit", authenticate, protect, validate(checkPermissionSchema), roomController.checkPermission)
roomRouter.put("/remove_from_project", authenticate, protect, validate(remove_from_project_Schema), roomController.removeUserFromContributers)

export default roomRouter