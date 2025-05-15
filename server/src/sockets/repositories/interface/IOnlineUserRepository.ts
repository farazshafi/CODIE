

export interface IOnlineUserRepository {
    addUserToRoom(projectId: string, userId: string, socketId: string): Promise<void>;
    getUsersInRoom(projectId: string): Promise<string[]>;
    removeUserFromAllRooms(socketId: string): Promise<string[]>;
    isUserOnline(projectId:string, userId:string): Promise<boolean>;
}