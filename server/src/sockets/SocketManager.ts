
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
import { logger } from '../utils/logger';

export class SocketManager {
    private io: Server;
    private _userSocketRepository: UserSocketRepository;
    private _onlineUserRepository: OnlineUserRepository;
    private _eventHandlers: IEventHandler[];

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

        this._userSocketRepository = userSocketRepository;
        this._onlineUserRepository = onlineUserRepository;

        this._eventHandlers = [
            new EditorEvents(this.io, editorService, this._userSocketRepository, this._onlineUserRepository),
            new InvitationEvents(this.io, roomSocketService, this._userSocketRepository),
            new MessageEvents(this.io, messageService),
            new RequestEvents(this.io, roomSocketService, this._userSocketRepository),
            new UserEvents(this.io, userSocketService, this._userSocketRepository)
        ];
    }

    public initialize() {
        this.io.on('connection', (socket: Socket) => {
            logger.info({ socketId: socket.id }, "New client connected");

            socket.on('register-user', async (userId: string) => {
                await this._userSocketRepository.add(userId, socket.id);
                logger.info({ userId, socketId: socket.id }, "User registered");
            });

            this._eventHandlers.forEach(handler => handler.register(socket));

            socket.on('disconnect', async () => {
                const userId = await this._userSocketRepository.getUserId(socket.id);
                if (userId) {
                    // Notify other services about the disconnection
                    this._eventHandlers.forEach(handler => {
                        if (handler.onDisconnect) {
                            handler.onDisconnect(socket);
                        }
                    });
                    await this._userSocketRepository.remove(socket.id);
                    logger.info({ userId, socketId: socket.id }, "User disconnected");
                }
            });
        });
    }
}
