// src/sockets/socketServer.ts
import { Server } from 'socket.io';
import { RoomSocketController } from './controllers/RoomSocketController';
import { RoomSocketService } from './services/RoomSocketService';
import { invitationRepository, mailService, projectRepository, requestRepository, requestService, roomRepository, userRepository } from '../container';
import { UserSocketRepository } from './repositories/UserSocketRepository';
import { OnlineUserRepository } from './repositories/OnlineUserRepository';
import { EditorService } from './services/EditorService';
import { EditorController } from './controllers/EditorController';
import { JoinProjectData, leaveProjectData, updateRoleData } from '../types/socketType';

export function setupSocket(io: Server) {
    const userSocketRepository = new UserSocketRepository();
    const onlineUserRepository = new OnlineUserRepository();

    const editorService = new EditorService(onlineUserRepository, roomRepository, projectRepository);
    const editorController = new EditorController(editorService, userRepository);

    io.on('connection', (socket) => {
        socket.on('register-user', (userId: string) => {
            userSocketRepository.add(userId, socket.id);
            console.log(`User registered: ${userId}, Socket ID: ${socket.id}`.blue);
        });

        socket.on('join-project', (data: JoinProjectData) => {
            editorController.handleJoinRoom(data, socket)

            socket.data.projectId = data.projectId;
            socket.data.userId = data.userId;
        })

        socket.on('leave-project', (data: leaveProjectData) => {
            editorController.handleLeaveRoom(data, socket)
        });

        socket.on('code-update', (data) => {
            console.log("comming here... ")
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