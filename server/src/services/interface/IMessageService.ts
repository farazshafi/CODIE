import { IMessage } from "../../models/MessageModel";


export interface IMessageService {
    createMessage(data: Partial<IMessage>): Promise<IMessage>
    getMessagesForRoom(roomId: string): Promise<IMessage[]>;
}