import { createClient } from "redis";
import { IOnlineUserRepository } from "./interface/IOnlineUserRepository";

const redisUrl = `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;


export class OnlineUserRepository implements IOnlineUserRepository {
    private readonly _redis = createClient({ url: redisUrl });

    constructor() {
        this._initializeRedis();
    }

    private async _initializeRedis() {
        this._redis.on('error', (err) => console.error('Redis Client Error', err));
        await this._redis.connect();
        console.log('Redis client connected'.green);
    }

    async addUserToRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        if (!this._redis.isOpen) {
            await this._redis.connect();
        }
        const key = `room:${projectId}:users`;
        await this._redis.hSet(key, socketId, userId);
    }

    async getUsersInRoom(projectId: string): Promise<string[]> {
        if (!this._redis.isOpen) {
            await this._redis.connect();
        }
        const key = `room:${projectId}:users`;
        const usersMap = await this._redis.hGetAll(key);
        const userIds = Object.values(usersMap)
        return [...new Set(userIds)]
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        if (!this._redis.isOpen) {
            await this._redis.connect();
        }
        const key = `room:${projectId}:users`
        const userMap = await this._redis.hGetAll(key)
        return Object.values(userMap).includes(userId)
    }

    async removeUserFromRoom(projectId: string, userId: string, socketId: string): Promise<void> {
        if (!this._redis.isOpen) {
            await this._redis.connect();
        }

        const key = `room:${projectId}:users`;

        const existingUserId = await this._redis.hGet(key, socketId);

        if (existingUserId === userId) {
            await this._redis.hDel(key, socketId);
            console.log(`Removed user ${userId} from project ${projectId}`);
        }
    }

    async getSocketIdByUserId(projectId: string, userId: string): Promise<string | null> {
        if (!this._redis.isOpen) {
            await this._redis.connect();
        }

        const key = `room:${projectId}:users`
        const userMap = await this._redis.hGetAll(key)

        for (const [socketId, storedUserId] of Object.entries(userMap)) {
            if (storedUserId === userId) {
                return socketId
            }
        }

        return null
    }

}