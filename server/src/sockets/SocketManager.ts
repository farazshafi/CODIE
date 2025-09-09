
import { Server, Socket } from 'socket.io';
import http from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { UserSocketRepository } from './repositories/UserSocketRepository';
import { OnlineUserRepository } from './repositories/OnlineUserRepository';
import { EditorEvents } from './events/EditorEvents';
import { InvitationEvents } from './events/InvitationEvents';
import { MessageEvents } from './events/MessageEvents';
import { RequestEvents } from './events/RequestEvents';
import { UserEvents } from './events/UserEvents';
import { editorService, roomSocketService, messageService, userSocketService, userSocketRepository, onlineUserRepository } from '../container';
import { IEventHandler } from './events/EventHandler';
import redis from '../config/redis';

export class SocketManager {
    private io: Server;
    private userSocketRepository: UserSocketRepository;
    private onlineUserRepository: OnlineUserRepository;
    private eventHandlers: IEventHandler[];

    constructor(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        const pubClient = redis.duplicate();
        const subClient = redis.duplicate();

        this.io.adapter(createAdapter(pubClient, subClient));

        this.userSocketRepository = userSocketRepository;
        this.onlineUserRepository = onlineUserRepository;

        this.eventHandlers = [
            new EditorEvents(this.io, editorService, this.userSocketRepository, this.onlineUserRepository),
            new InvitationEvents(this.io, roomSocketService, this.userSocketRepository),
            new MessageEvents(this.io, messageService),
            new RequestEvents(this.io, roomSocketService, this.userSocketRepository),
            new UserEvents(this.io, userSocketService, this.userSocketRepository)
        ];
    }

    public initialize() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`.cyan);

            socket.on('register-user', async (userId: string) => {
                await this.userSocketRepository.add(userId, socket.id);
                console.log(`User registered: ${userId}, Socket ID: ${socket.id}`.blue);
            });

            this.eventHandlers.forEach(handler => handler.register(socket));

            socket.on('disconnect', async () => {
                const userId = await this.userSocketRepository.getUserId(socket.id);
                if (userId) {
                    // Notify other services about the disconnection
                    this.eventHandlers.forEach(handler => {
                        if (handler.onDisconnect) {
                            handler.onDisconnect(socket);
                        }
                    });
                    await this.userSocketRepository.remove(socket.id);
                    console.log(`User disconnected: ${userId}`.red);
                }
            });
        });
    }
}
