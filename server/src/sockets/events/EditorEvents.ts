
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IEditorService } from '../services/interface/IEditorService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { IOnlineUserRepository } from '../repositories/interface/IOnlineUserRepository';
import { JoinProjectData, leaveProjectData, updateCodeData, updateRoleData } from '../../types/socketType';

export class EditorEvents implements IEventHandler {
    private io: Server;
    private editorService: IEditorService;
    private userSocketRepository: IUserSocketRepository;
    private onlineUserRepository: IOnlineUserRepository;

    constructor(
        io: Server,
        editorService: IEditorService,
        userSocketRepository: IUserSocketRepository,
        onlineUserRepository: IOnlineUserRepository
    ) {
        this.io = io;
        this.editorService = editorService;
        this.userSocketRepository = userSocketRepository;
        this.onlineUserRepository = onlineUserRepository;
    }

    public register(socket: Socket): void {
        socket.on('join-project', (data: JoinProjectData) => this.handleJoinRoom(data, socket));
        socket.on('leave-project', (data: leaveProjectData) => this.handleLeaveRoom(data, socket));
        socket.on('code-update', (data: updateCodeData) => this.handleCodeUpdate(data, socket));
        socket.on('notify-role-change', (data: updateRoleData) => this.handleUpdateRole(data, socket));
    }

    public onDisconnect(socket: Socket): void {
        const projectId = socket.data.projectId;
        const userId = socket.data.userId;
        if (projectId && userId) {
            this.handleLeaveRoom({ projectId, userId, userName: "" }, socket);
        }
    }

    private async handleJoinRoom(data: JoinProjectData, client: Socket): Promise<void> {
        const onlineUsers = await this.editorService.joinRoom(data.projectId, data.userId, client.id);

        client.join(data.projectId);
        client.emit('online-users', onlineUsers);

        client.to(data.projectId).emit('online-users', onlineUsers);
        const joinedUserName = "A user";

        client.to(data.projectId).emit("user-joined", {
            message: `${joinedUserName} Joined`
        });

        client.data.projectId = data.projectId;
        client.data.userId = data.userId;
    }

    private async handleLeaveRoom(data: leaveProjectData, client: Socket): Promise<void> {
        const onlineUsers = await this.editorService.leaveRoom(data.projectId, data.userId, client.id);

        client.leave(data.projectId);

        client.to(data.projectId).emit('online-users', onlineUsers);

        client.to(data.projectId).emit("user-left", {
            message: `${data.userName} left the editor.`
        });
    }

    private async handleCodeUpdate(data: updateCodeData, client: Socket): Promise<void> {
        const { userId, projectId, code } = data;
        const room = await this.editorService.getRoomByProjectId(projectId);
        if (!room) {
            client.emit('error', { message: 'Room not found' });
            return;
        }

        const isOwner = room.owner.toString() === userId;
        const collaborator = room.collaborators.find(c => c.user._id.equals(userId));
        const role = isOwner ? "owner" : collaborator?.role;

        if (role === "owner" || role === "editor") {
            client.to(projectId).emit("code-update", { code, userId });
        }
    }

    private async handleUpdateRole(data: updateRoleData, socket: Socket): Promise<void> {
        const { userId, role, projectId } = data;

        const isUserOnline = await this.editorService.isUserOnline(projectId, userId);
        if (!isUserOnline) {
            socket.emit("error", { message: "user to update not in online" });
            return;
        }
        const targetSocketId = await this.editorService.getSocketIdByUserId(userId, projectId);
        if (!targetSocketId) {
            socket.emit("error", { message: "targetted socket not found" });
            return;
        }
        socket.to(targetSocketId).emit("updated-role", { message: `You Permision changed to ${role}` });
        socket.to(targetSocketId).emit("refetch-permission");
    }
}
