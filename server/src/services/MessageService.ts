import { IMessage } from "../models/MessageModel";
import { IMessageRepository } from "../repositories/interface/IMessageRepository";
import { IMessageService } from "./interface/IMessageService";


export class MessageService implements IMessageService {
    constructor(
        private readonly _messageRepo: IMessageRepository
    ) { }

    async createMessage(data: Partial<IMessage>): Promise<IMessage> {
        return await this._messageRepo.create(data)
    }

    async getMessagesForRoom(roomId: string): Promise<IMessage[]> {
        return await this._messageRepo.getMessagesByRoomId(roomId);

    }
}