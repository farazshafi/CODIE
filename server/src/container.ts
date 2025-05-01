// src/container.ts
import { ProjectController } from './controllers/ProjectController';
import ProjectModel from './models/projectModel';
import UserModel from './models/userModel';
import { ProjectRepository } from './repositories/projectRepositories';
import { UserRepository } from './repositories/userRepositories';
import { ProjectService } from './services/projectServices';
import { UserService } from './services/userServices';

// Set up repositories
export const projectRepository = new ProjectRepository(ProjectModel);
export const userRepository = new UserRepository(UserModel)

// Set up services
export const projectService = new ProjectService(projectRepository);
export const userService = new UserService(userRepository)

// Set up controller

export const projectController = new ProjectController(projectService)