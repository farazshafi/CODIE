
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IMessageService } from '../../services/interface/IMessageService';
import { ISentMessage } from '../../types/socketType';

export class MessageEvents implements IEventHandler {
    private io: Server;
    private messageService: IMessageService;

    constructor(io: Server, messageService: IMessageService) {
        this.io = io;
        this.messageService = messageService;
    }

    public register(socket: Socket): void {
        socket.on("send-message", (data: ISentMessage) => this.saveMessage(data, socket));
    }

    private async saveMessage(data: ISentMessage, socket: Socket): Promise<void> {
        const savedMessages = await this.messageService.createMessage(data);
        this.io.to(data.projectId).emit("recived-message", { ...savedMessages.toObject() });
    }
}
