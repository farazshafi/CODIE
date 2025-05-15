// src/sockets/socketServer.ts
import { Server } from 'socket.io';
import { RoomSocketController } from './controllers/RoomSocketController';
import { RoomSocketService } from './services/RoomSocketService';
import { invitationRepository, mailService, projectRepository, requestRepository, requestService, roomRepository, userRepository } from '../container';
import { UserSocketRepository } from './repositories/UserSocketRepository';
import { OnlineUserRepository } from './repositories/OnlineUserRepository';
import { EditorService } from './services/EditorService';
import { EditorController } from './controllers/EditorController';
import { JoinProjectData } from '../types/socketType';

export function setupSocket(io: Server) {
    const userSocketRepository = new UserSocketRepository();
    const onlineUserRepository = new OnlineUserRepository();

    const editorService = new EditorService(onlineUserRepository);
    const editorController = new EditorController(editorService);

    io.on('connection', (socket) => {
        socket.on('register-user', (userId: string) => {
            userSocketRepository.add(userId, socket.id);
            console.log(`User registered: ${userId}, Socket ID: ${socket.id}`.blue);
        });

        socket.on('join-project', (data: JoinProjectData) => {
            editorController.handleJoinRoom(data, socket)
        })

        socket.on('disconnect', () => {
            userSocketRepository.remove(socket.id);
            editorController.handleDisconnect(socket)
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