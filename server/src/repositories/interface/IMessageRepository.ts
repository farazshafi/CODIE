import { IMessage } from "../../models/messageModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IMessageRepository extends IBaseRepository<IMessage> {
    getMessagesByRoomId(roomId: string): Promise<IMessage[]>;
}