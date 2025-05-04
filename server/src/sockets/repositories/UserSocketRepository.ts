
import { IUserSocketRepository } from "./interface/IUserSocketRepository";

export class UserSocketRepository implements IUserSocketRepository {
    private userSocketMap: Map<string, string> = new Map(); // userId -> socketId
    private socketUserMap: Map<string, string> = new Map(); // socketId -> userId

    add(userId: string, socketId: string): void {
        this.userSocketMap.set(userId, socketId);
        this.socketUserMap.set(socketId, userId);
    }

    remove(socketId: string): void {
        const userId = this.socketUserMap.get(socketId);
        if (userId) {
            this.userSocketMap.delete(userId);
            this.socketUserMap.delete(socketId);
        }
    }

    getSocketId(userId: string): string | undefined {
        return this.userSocketMap.get(userId);
    }

    getUserId(socketId: string): string | undefined {
        return this.socketUserMap.get(socketId);
    }
}