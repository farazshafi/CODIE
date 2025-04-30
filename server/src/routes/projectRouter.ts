import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { createProject, deleteProject, getProjectByRoomId, getSavedCode, saveCode } from '../controllers/ProjectController';
import { authenticate } from '../middlewares/authenticate';
import { updateCodeSchema } from '../validation/editorValidation';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, validate(createProjectSchema), createProject);
projectRouter.delete('/delete_project/:id', authenticate, deleteProject);
projectRouter.get('/project_by_room_id/:roomId', authenticate, getProjectByRoomId);
projectRouter.put("/save_code", authenticate, validate(updateCodeSchema), saveCode)
projectRouter.get("/get_code/:id", authenticate, getSavedCode)
export default projectRouter;