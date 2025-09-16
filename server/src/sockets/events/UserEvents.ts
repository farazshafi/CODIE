
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IUserSocketService } from '../services/interface/IUserSocketService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';

export class UserEvents implements IEventHandler {
    private io: Server;
    private _userSocketService: IUserSocketService;
    private _userSocketRepository: IUserSocketRepository;

    constructor(
        io: Server,
        userSocketService: IUserSocketService,
        userSocketRepository: IUserSocketRepository
    ) {
        this.io = io;
        this._userSocketService = userSocketService;
        this._userSocketRepository = userSocketRepository;
    }

    public register(socket: Socket): void {
        socket.on("block-user", (data: { userId: string }) => this._handleBlockUser(data.userId));
    }

    private async _handleBlockUser(userId: string): Promise<void> {
        const userSocket = await this._userSocketRepository.getSocketId(userId);
        if (!userSocket) return;
        this.io.to(userSocket).emit("user-blocked", { message: "You are Blocked!" });
    }
}
