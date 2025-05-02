// src/container.ts
import { ProjectController } from './controllers/ProjectController';
import { RequestController } from './controllers/requestController';
import { UserController } from './controllers/userController';
import OtpModel from './models/otpModel';
import ProjectModel from './models/projectModel';
import RequestModel from './models/requestModel';
import UserModel from './models/userModel';
import { OtpRepository } from './repositories/otpRepositories';
import { ProjectRepository } from './repositories/projectRepositories';
import { RequestRepositories } from './repositories/requestRepositories';
import { UserRepository } from './repositories/userRepositories';
import { OtpService } from './services/otpServices';
import { ProjectService } from './services/projectServices';
import { RequestService } from './services/requestServices';
import { UserService } from './services/userServices';

// Set up repositories
export const projectRepository = new ProjectRepository(ProjectModel)
export const userRepository = new UserRepository(UserModel)
export const requestRepository = new RequestRepositories(RequestModel)
export const otpRepository = new OtpRepository(OtpModel)

// Set up services
export const projectService = new ProjectService(projectRepository);
export const userService = new UserService(userRepository)
export const requestService = new RequestService(requestRepository)
export const otpService = new OtpService(otpRepository)

// Set up controller
export const projectController = new ProjectController(projectService)
export const userController = new UserController(userService, otpService)
export const requestController = new RequestController(requestService)