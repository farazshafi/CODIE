

export interface IUserSocketRepository {
    add(userId: string, socketId: string): void;
    remove(socketId: string): void;
    getSocketId(userId: string): string | undefined;
    getUserId(socketId: string): string | undefined;
}