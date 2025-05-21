import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { authenticate } from '../middlewares/authenticate';
import { updateCodeSchema } from '../validation/editorValidation';
import { projectController } from '../container';
import { authorizeRole } from '../middlewares/authorizeRole';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, validate(createProjectSchema), projectController.createProject);
projectRouter.delete('/delete_project/:id', authenticate, projectController.deleteProject);
projectRouter.get('/project_by_room_id/:roomId', authenticate, projectController.getProjectByRoomId);
projectRouter.put("/save_code", authenticate, validate(updateCodeSchema), authorizeRole(["editor", "owner"]), projectController.saveCode)
projectRouter.get("/get_code/:id", authenticate, projectController.getSavedCode)

export default projectRouter