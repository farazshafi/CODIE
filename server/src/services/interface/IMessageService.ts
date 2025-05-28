import { IMessage } from "../../models/messageModel";


export interface IMessageService {
    createMessage(data: Partial<IMessage>): Promise<IMessage>
    getMessagesForRoom(roomId: string): Promise<IMessage[]>;
}