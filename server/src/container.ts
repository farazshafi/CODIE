// src/container.ts
import ProjectModel from './models/projectModel';
import UserModel from './models/userModel';
import { ProjectRepository } from './repositories/projectRepositories';
import { UserRepository } from './repositories/userRepositories';
import { ProjectService } from './services/projectServices';
import { UserService } from './services/userServices';

// Set up repositories
const projectRepository = new ProjectRepository(ProjectModel);
const userRepository = new UserRepository(UserModel)

// Set up services
export const projectService = new ProjectService(projectRepository);
export const userService = new UserService(userRepository)