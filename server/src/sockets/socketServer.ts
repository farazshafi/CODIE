import { Server } from 'socket.io';
import { RoomSocketService } from './services/RoomSocketService';
import { invitationRepository, mailService, messageService, projectRepository, requestRepository, requestService, roomRepository, userRepository } from '../container';
import { UserSocketRepository } from './repositories/UserSocketRepository';
import { OnlineUserRepository } from './repositories/OnlineUserRepository';
import { EditorService } from './services/EditorService';
import { EditorController } from './controllers/EditorController';
import { ApproveRequestData, ISentMessage, JoinProjectData, leaveProjectData, updateRoleData } from '../types/socketType';
import { UserSocketController } from './controllers/userSocketController';
import { UserSocketService } from './services/UserSocketService';
import { MessageSocketController } from './controllers/MessageSocketController';
import { RequestData } from '../types/roomTypes';
import { RequestSocketController } from './controllers/RequestSocketController';
import { InvitationSocketController } from './controllers/InvitationSocketController';

export function setupSocket(io: Server) {
    const userSocketRepository = new UserSocketRepository();
    const onlineUserRepository = new OnlineUserRepository();

    const roomSocketService = new RoomSocketService(
        roomRepository,
        requestService,
        requestRepository,
        userSocketRepository,
        userRepository,
        mailService,
        projectRepository,
        invitationRepository,
    );

    const editorService = new EditorService(onlineUserRepository, roomRepository, projectRepository);
    const editorController = new EditorController(editorService, userRepository);
    const userSocketService = new UserSocketService(userSocketRepository)
    const userSocketController = new UserSocketController(userSocketService)
    const messageSocketController = new MessageSocketController(messageService)
    const reqSocketController = new RequestSocketController(roomSocketService, userSocketRepository)
    const invitationSocketController = new InvitationSocketController(roomSocketService, userSocketRepository)

    io.on('connection', (socket) => {
        socket.on('register-user', (userId: string) => {
            userSocketRepository.add(userId, socket.id);
            console.log(`User registered: ${userId}, Socket ID: ${socket.id}`.blue)
        })

        socket.on('join-project', (data: JoinProjectData) => {
            editorController.handleJoinRoom(data, socket)
            socket.data.projectId = data.projectId;
            socket.data.userId = data.userId;
        })

        socket.on("join-request", async (data: RequestData) => {
            reqSocketController.handleJoinRequest(data, socket)
        });

        socket.on("approve-user", async (data: ApproveRequestData) => {
            reqSocketController.handleApproveRequest(data, socket)
        })

        socket.on("reject-user", async (data: ApproveRequestData) => {
            reqSocketController.handleReject(data, socket)
        });

        socket.on("send-invitation", async (data) => {
            invitationSocketController.sendInvitation(data, socket)
        });

        socket.on("approve-invitation", async (data) => {
            invitationSocketController.handleApproveInvitation(data, socket)
        });

        socket.on("reject-invitation", async (data) => {
            invitationSocketController.handleRejectInvitation(data, socket)
        });


        socket.on("send-message", (data: ISentMessage) => {
            messageSocketController.saveMessage(data, socket)
        })

        socket.on('leave-project', (data: leaveProjectData) => {
            editorController.handleLeaveRoom(data, socket)
        });

        socket.on("block-user", (data: { userId: string }) => {
            userSocketController.handleBlockUser(data.userId, socket)
        })

        socket.on('code-update', (data) => {
            editorController.handleCodeUpdate(data, socket);
        });

        socket.on("notify-role-change", (data: updateRoleData) => {
            editorController.handleUpdateRole(data, socket)
        })

        socket.on('disconnect', () => {
            userSocketRepository.remove(socket.id);

            const projectId = socket.data.projectId;
            const userId = socket.data.userId;

            editorController.handleLeaveRoom({ projectId, userId, userName: "" }, socket)
            console.log('Socket disconnected:', socket.id.red)
        });
    });
}