import { Model } from "mongoose";
import { IMessageRepository } from "./interface/IMessageRepository";
import { IMessage } from "../models/MessageModel";
import { BaseRepository } from "./BaseRepository";


export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
    constructor(model: Model<IMessage>) {
        super(model)
    }

    async getMessagesByRoomId(roomId: string): Promise<IMessage[]> {
        return await this.model.find({ roomId }).sort({ createdAt: 1 }).lean();
    }
}
