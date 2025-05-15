import { createClient } from "redis";
import { IOnlineUserRepository } from "./interface/IOnlineUserRepository";
import { object } from "zod";

export class OnlineUserRepository implements IOnlineUserRepository {
    private readonly redis = createClient();

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
        return Object.values(usersMap);
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
        const key = `room:${projectId}:users`
        const userMap = await this.redis.hGetAll(key)
        return Object.values(userMap).includes(userId)
    }

    async removeUserFromAllRooms(socketId: string): Promise<string[]> {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
        const keys = await this.redis.keys("room:*:users");
        const roomsLeft: string[] = [];

        for (const key of keys) {
            const user = await this.redis.hGet(key, socketId);
            if (user) {
                await this.redis.hDel(key, socketId);
                const projectId = key.split(':')[1];
                roomsLeft.push(projectId);
            }
        }

        return roomsLeft;
    }
}