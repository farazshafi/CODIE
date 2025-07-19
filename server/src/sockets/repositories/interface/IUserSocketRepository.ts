

export interface IUserSocketRepository {
    add(userId: string, socketId: string): Promise<void>;
    remove(socketId: string): Promise<void>;
    getSocketId(userId: string): Promise<string | undefined>;
    getUserId(socketId: string): Promise<string | undefined>;
}