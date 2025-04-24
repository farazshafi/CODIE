import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { createProject, deleteProject, getProjectByRoomId } from '../controllers/ProjectController';
import { authenticate } from '../middlewares/authenticate';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, validate(createProjectSchema), createProject);
projectRouter.delete('/delete_project/:id', authenticate, deleteProject);
projectRouter.get('/project_by_room_id/:roomId', authenticate, getProjectByRoomId);

export default projectRouter;