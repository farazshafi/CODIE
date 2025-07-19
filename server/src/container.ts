// src/container.ts
import { AdminController } from './controllers/AdminController';
import { DiscoverController } from './controllers/DiscoverController';
import { InvitationController } from './controllers/InvitationController';
import { MessageController } from './controllers/MessageController';
import { ProjectController } from './controllers/ProjectController';
import { RequestController } from './controllers/RequestController';
import { RoomController } from './controllers/RoomController';
import { SubscriptionController } from './controllers/SubscriptionController';
import { UserController } from './controllers/UserController';

import DiscoverModel from './models/DiscoverModel';
import InvitationModel from './models/InvitationModel';
import { MessageModel } from './models/MessageModel';
import OtpModel from './models/OtpModel';
import ProjectModel from './models/ProjectModel';
import RequestModel from './models/RequestModel';
import SubscriptionModel from './models/SubscriptionModel';
import UserModel from './models/UserModel';
import RoomModel from './models/RoomModel';


import { DiscoverRepository } from './repositories/DiscoverRepository';
import { InvitationRepository } from './repositories/InvitationRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { OtpRepository } from './repositories/OtpRepositories';
import { ProjectRepository } from './repositories/ProjectRepositories';
import { RequestRepositories } from './repositories/requestRepositories';
import { RoomRepositories } from './repositories/RoomRepositories';
import { SubscriptionRepository } from './repositories/SubscriptionRepository';
import { UserRepository } from './repositories/UserRepositories';
import { OnlineUserRepository } from './sockets/repositories/OnlineUserRepository';
import { UserSocketRepository } from './sockets/repositories/UserSocketRepository';

import { DiscoverService } from './services/DiscoverService';
import { InvitationService } from './services/InvitationService';
import { MailService } from './services/MailServices';
import { MessageService } from './services/MessageService';
import { OtpService } from './services/OtpServices';
import { ProjectService } from './services/ProjectServices';
import { RequestService } from './services/RequestServices';
import { RoomServices } from './services/RoomServices';
import { SubscriptionService } from './services/SubscriptionService';
import { UserService } from './services/UserServices';
import { EditorService } from './sockets/services/EditorService';
import { RoomSocketService } from './sockets/services/RoomSocketService';
import { UserSocketService } from './sockets/services/UserSocketService';

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
export const onlineUserRepository = new OnlineUserRepository()
export const userSocketRepository = new UserSocketRepository()

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
export const editorService = new EditorService(onlineUserRepository, roomRepository, projectRepository)
export const roomSocketService = new RoomSocketService(roomRepository, requestService, requestRepository, userSocketRepository, userRepository, mailService, projectRepository, invitationRepository)
export const userSocketService = new UserSocketService(userSocketRepository)


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