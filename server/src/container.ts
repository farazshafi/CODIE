// src/container.ts
import { AdminController } from './controllers/adminController';
import { DiscoverController } from './controllers/discoverController';
import { InvitationController } from './controllers/InvitationController';
import { MessageController } from './controllers/MessageController';
import { ProjectController } from './controllers/ProjectController';
import { RequestController } from './controllers/requestController';
import { RoomController } from './controllers/roomController';
import { SubscriptionController } from './controllers/subscriptionController';
import { UserController } from './controllers/userController';
import DiscoverModel from './models/discoverModel';

import InvitationModel from './models/InvitationModel';
import { MessageModel } from './models/messageModel';

import OtpModel from './models/otpModel';
import ProjectModel from './models/projectModel';
import RequestModel from './models/requestModel';
import RoomModel from './models/roomModel';
import SubscriptionModel from './models/subscriptionModel';
import UserModel from './models/userModel';
import { DiscoverRepository } from './repositories/DiscoverRepository';
import { InvitationRepository } from './repositories/invitationRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { OtpRepository } from './repositories/otpRepositories';
import { ProjectRepository } from './repositories/projectRepositories';
import { RequestRepositories } from './repositories/requestRepositories';
import { RoomRepositories } from './repositories/roomRepositories';
import { SubscriptionRepository } from './repositories/subscriptionRepository';
import { UserRepository } from './repositories/userRepositories';
import { DiscoverService } from './services/DiscoverService';
import { InvitationService } from './services/InvitationService';
import { MailService } from './services/mailServices';
import { MessageService } from './services/MessageService';
import { OtpService } from './services/otpServices';
import { ProjectService } from './services/projectServices';
import { RequestService } from './services/requestServices';
import { RoomServices } from './services/roomServices';
import { SubscriptionService } from './services/SubscriptionService';
import { UserService } from './services/userServices';

// Set up repositories
export const projectRepository = new ProjectRepository(ProjectModel)
export const userRepository = new UserRepository(UserModel)
export const requestRepository = new RequestRepositories(RequestModel)
export const otpRepository = new OtpRepository(OtpModel)
export const roomRepository = new RoomRepositories(RoomModel)
export const invitationRepository = new InvitationRepository(InvitationModel)
export const subscriptionRepository = new SubscriptionRepository(SubscriptionModel)
export const messageRepository = new MessageRepository(MessageModel)
export const discoverRepository = new DiscoverRepository(DiscoverModel)

// Set up services
export const projectService = new ProjectService(projectRepository, roomRepository);
export const userService = new UserService(userRepository)
export const requestService = new RequestService(requestRepository, roomRepository)
export const mailService = new MailService()
export const otpService = new OtpService(otpRepository, mailService)
export const roomService = new RoomServices(roomRepository, projectRepository)
export const invitationService = new InvitationService(invitationRepository, mailService, userRepository)
export const subscriptionService = new SubscriptionService(subscriptionRepository)
export const messageService = new MessageService(messageRepository)
export const discoverService = new DiscoverService(discoverRepository)

// Set up controller
export const projectController = new ProjectController(projectService)
export const userController = new UserController(userService, otpService, mailService)
export const requestController = new RequestController(requestService)
export const roomController = new RoomController(roomService)
export const invitationController = new InvitationController(invitationService)
export const adminController = new AdminController(userService)
export const subscriptionController = new SubscriptionController(subscriptionService)
export const messageController = new MessageController(messageService)
export const discoverController = new DiscoverController(discoverService)