import redis from "../../config/redis";
import { IOnlineUserRepository } from "./interface/IOnlineUserRepository";

export class OnlineUserRepository implements IOnlineUserRepository {
    async addUserToRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        const key = `room:${projectId}:users`;
        await redis.hset(key, socketId, userId);
    }

    async getUsersInRoom(projectId: string): Promise<string[]> {
        const key = `room:${projectId}:users`;
        const usersMap = await redis.hgetall(key);
        const userIds = Object.values(usersMap);
        return [...new Set(userIds)];
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        const key = `room:${projectId}:users`;
        const userMap = await redis.hgetall(key);
        return Object.values(userMap).includes(userId);
    }

    async removeUserFromRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        const key = `room:${projectId}:users`;
        const existingUserId = await redis.hget(key, socketId);

        if (existingUserId === userId) {
            await redis.hdel(key, socketId);
            console.log(`Removed user ${userId} from project ${projectId}`);
        }
    }

    async getSocketIdByUserId(projectId: string, userId: string): Promise<string | null> {
        const key = `room:${projectId}:users`;
        const userMap = await redis.hgetall(key);

        for (const [socketId, storedUserId] of Object.entries(userMap)) {
            if (storedUserId === userId) {
                return socketId;
            }
        }

        return null;
    }
}