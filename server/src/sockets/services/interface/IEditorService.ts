

export interface IEditorService {
    joinRoom(projectId: string, userId: string, socketId: string): Promise<string[]>;
    getOnlineUsers(projectId: string): Promise<string[]>;
    leaveRoom(projectId: string, userId: string, socketId: string): Promise<string[]>
}