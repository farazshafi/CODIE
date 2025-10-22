import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { authenticate } from '../middlewares/authenticate';
import { updateCodeSchema } from '../validation/editorValidation';
import { projectController } from '../container';
import { authorizeRole } from '../middlewares/authorizeRole';
import { protect } from '../middlewares/protectMiddleware';
import { isPrivate } from '../middlewares/isPrivate';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, protect, validate(createProjectSchema), projectController.createProject);
projectRouter.delete('/delete_project/:id', authenticate, protect, projectController.deleteProject);
projectRouter.get('/project_by_room_id/:roomId', authenticate, protect, projectController.getProjectByRoomId);
projectRouter.put("/save_code", authenticate, protect, validate(updateCodeSchema), authorizeRole(["editor"]), projectController.saveCode)
projectRouter.get("/get_code/:id", authenticate, protect, projectController.getSavedCode)
projectRouter.get("/get_used_languages/:userId", authenticate, protect, isPrivate, projectController.getUsedLangauges)
projectRouter.get("/get_projects", authenticate, protect, projectController.getProjects)
projectRouter.get("/get_contributed_projects/:userId", authenticate, protect, projectController.getContributedProjects)
projectRouter.get("/get_contributor_details/:userId", authenticate, protect, isPrivate, projectController.getContributorDeatils)
projectRouter.get("/get_projects_details/:userId", authenticate, protect, isPrivate, projectController.getProjectsByUserId)

export default projectRouter