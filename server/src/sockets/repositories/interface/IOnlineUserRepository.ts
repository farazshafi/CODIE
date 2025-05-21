

export interface IOnlineUserRepository {
    addUserToRoom(projectId: string, userId: string, socketId: string): Promise<void>;
    getUsersInRoom(projectId: string): Promise<string[]>;
    isUserOnline(projectId: string, userId: string): Promise<boolean>;
    removeUserFromRoom(projectId: string, userId: string, socketId: string): Promise<void>;
    getSocketIdByUserId(projectId: string, userId: string): Promise<string | null>;
}