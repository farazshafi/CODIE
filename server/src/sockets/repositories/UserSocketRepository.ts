
import redis from "../../config/redis";
import { IUserSocketRepository } from "./interface/IUserSocketRepository";

export class UserSocketRepository implements IUserSocketRepository {
    private _userSocketKey = "user:sockets";
    private _socketUserKey = "socket:users";

    async add(userId: string, socketId: string): Promise<void> {
        await redis.hset(this._userSocketKey, userId, socketId);
        await redis.hset(this._socketUserKey, socketId, userId);
    }

    async remove(socketId: string): Promise<void> {
        const userId = await this.getUserId(socketId);
        if (userId) {
            await redis.hdel(this._userSocketKey, userId);
            await redis.hdel(this._socketUserKey, socketId);
        }
    }

    async getSocketId(userId: string): Promise<string | undefined> {
        const socketId = await redis.hget(this._userSocketKey, userId);
        
        return socketId ?? undefined;
    }

    async getUserId(socketId:string): Promise<string | undefined> {
        const userId = await redis.hget(this._socketUserKey, socketId);
        return userId ?? undefined;
    }
}
