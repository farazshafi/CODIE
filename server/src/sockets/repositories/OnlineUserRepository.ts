import { createClient } from "redis";
import { IOnlineUserRepository } from "./interface/IOnlineUserRepository";

const redisUrl = `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;


export class OnlineUserRepository implements IOnlineUserRepository {
    private readonly redis = createClient({ url: redisUrl });

    constructor() {
        this.initializeRedis();
    }

    private async initializeRedis() {
        this.redis.on('error', (err) => console.error('Redis Client Error', err));
        await this.redis.connect();
        console.log('Redis client connected'.green);
    }

    async addUserToRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
        const key = `room:${projectId}:users`;
        await this.redis.hSet(key, socketId, userId);
    }

    async getUsersInRoom(projectId: string): Promise<string[]> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
        const key = `room:${projectId}:users`;
        const usersMap = await this.redis.hGetAll(key);
        const userIds = Object.values(usersMap)
        return [...new Set(userIds)]
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
        const key = `room:${projectId}:users`
        const userMap = await this.redis.hGetAll(key)
        return Object.values(userMap).includes(userId)
    }

    async removeUserFromRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }

        const key = `room:${projectId}:users`;

        const existingUserId = await this.redis.hGet(key, socketId);

        if (existingUserId === userId) {
            await this.redis.hDel(key, socketId);
            console.log(`Removed user ${userId} from project ${projectId}`);
        }
    }

    async getSocketIdByUserId(projectId: string, userId: string): Promise<string | null> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }

        const key = `room:${projectId}:users`
        const userMap = await this.redis.hGetAll(key)

        for (const [socketId, storedUserId] of Object.entries(userMap)) {
            if (storedUserId === userId) {
                return socketId
            }
        }

        return null
    }

}