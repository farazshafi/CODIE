

export interface IUserSocketService {
    getSocketId(userId: string): Promise<string | undefined>;
}