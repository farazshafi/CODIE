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
import { UserSubscriptionController } from './controllers/UserSubscriptionController';
import { StarredController } from './controllers/StarredController';
import { PaymentController } from './controllers/PaymentController';

import DiscoverModel from './models/DiscoverModel';
import InvitationModel from './models/InvitationModel';
import { MessageModel } from './models/MessageModel';
import OtpModel from './models/OtpModel';
import ProjectModel from './models/ProjectModel';
import RequestModel from './models/RequestModel';
import SubscriptionModel from './models/SubscriptionModel';
import UserModel from './models/UserModel';
import RoomModel from './models/RoomModel';
import UserSubscriptionModel from './models/UserSubscriptionModel';
import StarredModel from './models/StarredModel';
import PaymentModel from './models/PaymentModel';


import { DiscoverRepository } from './repositories/DiscoverRepository';
import { InvitationRepository } from './repositories/InvitationRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { OtpRepository } from './repositories/OtpRepositories';
import { ProjectRepository } from './repositories/ProjectRepositories';
import { RequestRepositories } from './repositories/RequestRepositories';
import { RoomRepositories } from './repositories/RoomRepositories';
import { SubscriptionRepository } from './repositories/SubscriptionRepository';
import { UserRepository } from './repositories/UserRepositories';
import { OnlineUserRepository } from './sockets/repositories/OnlineUserRepository';
import { UserSocketRepository } from './sockets/repositories/UserSocketRepository';
import { UserSubscriptionRepository } from './repositories/UserSubscriptionRepository';
import { StarredRepository } from './repositories/StarredRepository';
import { PaymentRepository } from './repositories/PaymentRepository';

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
import { UserSubscriptionService } from './services/UserSubscriptionService';
import { StarredService } from './services/StarredService';
import { PaymentService } from './services/PaymentService';

import { SubscriptionCron } from './crons/SubscriptionCron';

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
export const userSubscriptionRepository = new UserSubscriptionRepository(UserSubscriptionModel)
export const starredRepository = new StarredRepository(StarredModel)
export const paymentRepository = new PaymentRepository(PaymentModel)

// Set up services
export const userService = new UserService(userRepository, userSubscriptionRepository, subscriptionRepository)
export const requestService = new RequestService(requestRepository, roomRepository)
export const mailService = new MailService()
export const otpService = new OtpService(otpRepository, mailService)
export const roomService = new RoomServices(roomRepository, projectRepository)
export const projectService = new ProjectService(projectRepository, roomRepository, subscriptionRepository, userSubscriptionRepository, roomService);
export const invitationService = new InvitationService(invitationRepository, mailService, userRepository, roomRepository, userSubscriptionRepository, subscriptionRepository)
export const subscriptionService = new SubscriptionService(subscriptionRepository)
export const messageService = new MessageService(messageRepository)
export const discoverService = new DiscoverService(discoverRepository)
export const editorService = new EditorService(onlineUserRepository, roomRepository, projectRepository)
export const roomSocketService = new RoomSocketService(roomRepository, requestService, requestRepository, userSocketRepository, userRepository, mailService, projectRepository, invitationRepository, userSubscriptionRepository, subscriptionRepository)
export const userSocketService = new UserSocketService(userSocketRepository)
export const paymentService = new PaymentService(paymentRepository)
export const userSubscriptionService = new UserSubscriptionService(userSubscriptionRepository, subscriptionRepository, mailService, userRepository, paymentService)
export const starredService = new StarredService(starredRepository)

// Set up controller
export const projectController = new ProjectController(projectService, roomService)
export const userController = new UserController(userService, otpService, mailService)
export const requestController = new RequestController(requestService)
export const roomController = new RoomController(roomService)
export const invitationController = new InvitationController(invitationService)
export const adminController = new AdminController(userService, projectService, paymentService)
export const subscriptionController = new SubscriptionController(subscriptionService)
export const messageController = new MessageController(messageService)
export const discoverController = new DiscoverController(discoverService)
export const userSubscriptionController = new UserSubscriptionController(userSubscriptionService)
export const starredController = new StarredController(starredService)
export const paymentController = new PaymentController(paymentService)

// crons
export const subscriptionCron = new SubscriptionCron(userSubscriptionService)