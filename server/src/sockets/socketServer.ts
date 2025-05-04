// src/sockets/socketServer.ts
import { Server } from 'socket.io';
import { RoomSocketController } from './controllers/RoomSocketController';
import { RoomSocketService } from './services/RoomSocketService';
import { requestRepository, requestService, roomRepository } from '../container';
import { UserSocketRepository } from './repositories/UserSocketRepository';

export function setupSocket(io: Server) {
    const userSocketRepository = new UserSocketRepository();

    io.on('connection', (socket) => {

        socket.on('register-user', (userId: string) => {
            userSocketRepository.add(userId, socket.id);
            console.log(`User registered: ${userId}, Socket ID: ${socket.id}`.blue);
        });

        socket.on('disconnect', () => {
            userSocketRepository.remove(socket.id);
            console.log('Socket disconnected:', socket.id.red)
        });
    });

    const roomSocketService = new RoomSocketService(
        roomRepository,
        requestService,
        requestRepository,
        userSocketRepository
    );

    const roomSocketController = new RoomSocketController(io, roomSocketService, userSocketRepository);

    io.on('connection', (socket) => {
        roomSocketController.handleJoinRequest(socket);
        roomSocketController.handleApproveUser(socket);
        roomSocketController.handleRejectUser(socket);
    });
}