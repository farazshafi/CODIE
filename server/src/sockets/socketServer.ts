import { Server } from 'socket.io';
import { RoomSocketController } from './controllers/RoomSocketController';
import { RoomSocketService } from './services/RoomSocketService';
import { invitationRepository, mailService, projectRepository, requestRepository, requestService, roomRepository, userRepository } from '../container';
import { UserSocketRepository } from './repositories/UserSocketRepository';
import { OnlineUserRepository } from './repositories/OnlineUserRepository';
import { EditorService } from './services/EditorService';
import { EditorController } from './controllers/EditorController';
import { JoinProjectData, leaveProjectData, updateRoleData } from '../types/socketType';
import { UserSocketController } from './controllers/userSocketController';
import { UserSocketService } from './services/UserSocketService';

export function setupSocket(io: Server) {
    const userSocketRepository = new UserSocketRepository();
    const onlineUserRepository = new OnlineUserRepository();

    const editorService = new EditorService(onlineUserRepository, roomRepository, projectRepository);
    const editorController = new EditorController(editorService, userRepository);
    const userSocketService = new UserSocketService(userSocketRepository)
    const userSocketController = new UserSocketController(userSocketService)

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

    const roomSocketController = new RoomSocketController(io, roomSocketService, userSocketRepository);

    io.on('connection', (socket) => {
        // request
        roomSocketController.handleJoinRequest(socket);
        roomSocketController.handleApproveUser(socket);
        roomSocketController.handleRejectUser(socket);

        // invitations
        roomSocketController.handleApproveInvitation(socket)
        roomSocketController.handleRejectInvitation(socket)
        roomSocketController.sendInvitation(socket)
    });
}