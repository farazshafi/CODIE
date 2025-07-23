
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IUserSocketService } from '../services/interface/IUserSocketService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';

export class UserEvents implements IEventHandler {
    private io: Server;
    private userSocketService: IUserSocketService;
    private userSocketRepository: IUserSocketRepository;

    constructor(
        io: Server,
        userSocketService: IUserSocketService,
        userSocketRepository: IUserSocketRepository
    ) {
        this.io = io;
        this.userSocketService = userSocketService;
        this.userSocketRepository = userSocketRepository;
    }

    public register(socket: Socket): void {
        socket.on("block-user", (data: { userId: string }) => this.handleBlockUser(data.userId));
    }

    private async handleBlockUser(userId: string): Promise<void> {
        const userSocket = await this.userSocketRepository.getSocketId(userId);
        if (!userSocket) return;
        this.io.to(userSocket).emit("user-blocked", { message: "You are Blocked!" });
    }
}
