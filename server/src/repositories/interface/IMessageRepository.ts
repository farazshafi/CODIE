import { IMessage } from "../../models/MessageModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IMessageRepository extends IBaseRepository<IMessage> {
    getMessagesByRoomId(roomId: string): Promise<IMessage[]>;
}