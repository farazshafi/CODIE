import { Model } from "mongoose";
import { IMessageRepository } from "./interface/IMessageRepository";
import { IMessage, MessageModel } from "../models/messageModel";
import { BaseRepository } from "./baseRepository";


export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
    constructor(model: Model<IMessage>) {
        super(model)
    }

    async getMessagesByRoomId(roomId: string): Promise<IMessage[]> {
        return await MessageModel.find({ roomId }).sort({ createdAt: 1 }).lean();

    }
}