import { Socket } from "socket.io";

export interface ISocketService {
    handleConnection(socket: Socket): void;
    emitToUser(userId: string, event: string, data: any): void;
    emitToRoom(roomId: string, event: string, data: any): void;
}
