// src/config/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ENV } from './env';

let io: Server;

export const initSocket = (server: HttpServer): Server => {
    io = new Server(server, {
        cors: {
            origin: ENV.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};