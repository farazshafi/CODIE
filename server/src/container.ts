// src/container.ts
import ProjectModel from './models/projectModel';
import { ProjectRepository } from './repositories/projectRepositories';
import { ProjectService } from './services/projectServices';

// Set up repositories
const projectRepository = new ProjectRepository(ProjectModel);

// Set up services
export const projectService = new ProjectService(projectRepository);