import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createProjectSchema } from '../validation/projectValidation';
import { createProject, deleteProject } from '../controllers/ProjectController';
import { authenticate } from '../middlewares/authenticate';

const projectRouter = Router();

projectRouter.post('/create_project', authenticate, validate(createProjectSchema), createProject);
projectRouter.delete('/delete_project/:id', authenticate, deleteProject);

export default projectRouter;