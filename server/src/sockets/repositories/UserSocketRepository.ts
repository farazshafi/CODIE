
import redis from "../../config/redis";
import { IUserSocketRepository } from "./interface/IUserSocketRepository";

export class UserSocketRepository implements IUserSocketRepository {
    private userSocketKey = "user:sockets";
    private socketUserKey = "socket:users";

    async add(userId: string, socketId: string): Promise<void> {
        await redis.hset(this.userSocketKey, userId, socketId);
        await redis.hset(this.socketUserKey, socketId, userId);
    }

    async remove(socketId: string): Promise<void> {
        const userId = await this.getUserId(socketId);
        if (userId) {
            await redis.hdel(this.userSocketKey, userId);
            await redis.hdel(this.socketUserKey, socketId);
        }
    }

    async getSocketId(userId: string): Promise<string | undefined> {
        const socketId = await redis.hget(this.userSocketKey, userId);
        
        return socketId ?? undefined;
    }

    async getUserId(socketId:string): Promise<string | undefined> {
        const userId = await redis.hget(this.socketUserKey, socketId);
        return userId ?? undefined;
    }
}
