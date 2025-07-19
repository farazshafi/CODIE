
import { Socket } from 'socket.io';

export interface IEventHandler {
    register(socket: Socket): void;
    onDisconnect?(socket: Socket): void;
}
