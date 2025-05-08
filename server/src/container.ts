// src/container.ts
import { InvitationController } from './controllers/InvitationController';
import { ProjectController } from './controllers/ProjectController';
import { RequestController } from './controllers/RequestController';
import { RoomController } from './controllers/RoomController';
import { UserController } from './controllers/UserController';
import InvitationModel from './models/InvitationModel';

import OtpModel from './models/otpModel';
import ProjectModel from './models/projectModel';
import RequestModel from './models/requestModel';
import RoomModel from './models/roomModel';
import UserModel from './models/userModel';
import { InvitationRepository } from './repositories/invitationRepository';
import { OtpRepository } from './repositories/otpRepositories';
import { ProjectRepository } from './repositories/projectRepositories';
import { RequestRepositories } from './repositories/requestRepositories';
import { RoomRepositories } from './repositories/roomRepositories';
import { UserRepository } from './repositories/userRepositories';
import { InvitationService } from './services/InvitationService';
import { MailService } from './services/mailServices';
import { OtpService } from './services/otpServices';
import { ProjectService } from './services/projectServices';
import { RequestService } from './services/requestServices';
import { RoomServices } from './services/roomServices';
import { UserService } from './services/userServices';

// Set up repositories
export const projectRepository = new ProjectRepository(ProjectModel)
export const userRepository = new UserRepository(UserModel)
export const requestRepository = new RequestRepositories(RequestModel)
export const otpRepository = new OtpRepository(OtpModel)
export const roomRepository = new RoomRepositories(RoomModel)
export const invitationRepository = new InvitationRepository(InvitationModel)

// Set up services
export const projectService = new ProjectService(projectRepository);
export const userService = new UserService(userRepository)
export const requestService = new RequestService(requestRepository, roomRepository)
export const mailService = new MailService()
export const otpService = new OtpService(otpRepository, mailService)
export const roomService = new RoomServices(roomRepository)
export const invitationService = new InvitationService(invitationRepository, mailService, userRepository)

// Set up controller
export const projectController = new ProjectController(projectService)
export const userController = new UserController(userService, otpService, mailService)
export const requestController = new RequestController(requestService)
export const roomController = new RoomController(roomService)
export const invitationController = new InvitationController(invitationService)