

export interface IEditorService {
    joinRoom(projectId: string, userId: string, socketId: string): Promise<string[]>;
    leaveAllRooms(socketId: string): Promise<string[]>;
    getOnlineUsers(projectId: string): Promise<string[]>
}