import { Socket } from "socket.io";
import { IMessageService } from "../../services/interface/IMessageService";
import { ISentMessage } from "../../types/socketType";


export class MessageSocketController {
    constructor(
        private readonly messageService: IMessageService
    ) { }

    async saveMessage(data: ISentMessage, socket: Socket) {
        const savedMessages = await this.messageService.createMessage(data)
        socket.to(data.projectId).emit("recived-message", { ...savedMessages.toObject() })
        socket.emit("recived-message", { ...savedMessages.toObject() })
    }
}