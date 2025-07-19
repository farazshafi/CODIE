import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { authenticate } from '../middlewares/authenticate';
import { updateCodeSchema } from '../validation/editorValidation';
import { projectController } from '../container';
import { authorizeRole } from '../middlewares/authorizeRole';
import { protect } from '../middlewares/protectMiddleware';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, protect, validate(createProjectSchema), projectController.createProject);
projectRouter.delete('/delete_project/:id', authenticate, protect, projectController.deleteProject);
projectRouter.get('/project_by_room_id/:roomId', authenticate, protect, projectController.getProjectByRoomId);
projectRouter.put("/save_code", authenticate, protect, validate(updateCodeSchema), authorizeRole(["editor"]), projectController.saveCode)
projectRouter.get("/get_code/:id", authenticate, protect, projectController.getSavedCode)

export default projectRouter