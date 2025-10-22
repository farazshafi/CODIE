import { Router } from "express";
import { validate } from "../middlewares/validate";
import { checkPermissionSchema, createRoomSchema, remove_from_project_Schema, updateRoleSchema } from "../validation/roomValidation";
import { authenticate } from "../middlewares/authenticate";
import { roomController } from "../container";
import { protect } from "../middlewares/protectMiddleware";
import { isPrivate } from "../middlewares/isPrivate";


const roomRouter = Router()

roomRouter.post("/create_room", authenticate, protect, validate(createRoomSchema), roomController.createRoom)
roomRouter.get("/get_room/:projectId", authenticate, protect, roomController.getRoomByProjectId)
roomRouter.get("/get_contributers/:projectId", authenticate, protect, roomController.getContributers)
roomRouter.post("/update_role", authenticate, protect, validate(updateRoleSchema), roomController.updateRole)
roomRouter.post("/ceck_permission_to_edit", authenticate, protect, validate(checkPermissionSchema), roomController.checkPermission)
roomRouter.put("/remove_from_project", authenticate, protect, validate(remove_from_project_Schema), roomController.removeUserFromContributers)
roomRouter.get("/get_all_contributers", authenticate, protect, roomController.getAllContributorsForUser)
roomRouter.get("/contributed_Projects_graph/:userId", authenticate, protect, isPrivate, roomController.getContributedProjectsGraph)
roomRouter.get("/recent_contributed_projects/:userId", authenticate, protect, isPrivate, roomController.getRecentContributonProjects)

export default roomRouter