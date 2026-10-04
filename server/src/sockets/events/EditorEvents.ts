import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IEditorService } from '../services/interface/IEditorService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { IOnlineUserRepository } from '../repositories/interface/IOnlineUserRepository';
import { JoinProjectData, leaveProjectData, updateCodeData, updateRoleData, CodeDeltaData, CursorUpdateData } from '../../types/socketType';
import redis from '../../config/redis';

const COLOR_PALETTE = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FF8C33',
    '#33FFF7', '#8D33FF', '#FF3333', '#33FF8C', '#FFD433'
];

export class EditorEvents implements IEventHandler {
    private io: Server;
    private _editorService: IEditorService;
    private _userSocketRepository: IUserSocketRepository;
    private _onlineUserRepository: IOnlineUserRepository;

    constructor(
        io: Server,
        _editorService: IEditorService,
        _userSocketRepository: IUserSocketRepository,
        _onlineUserRepository: IOnlineUserRepository
    ) {
        this.io = io;
        this._editorService = _editorService;
        this._userSocketRepository = _userSocketRepository;
        this._onlineUserRepository = _onlineUserRepository;
    }

    public register(socket: Socket): void {
        socket.on('join-project', (data: JoinProjectData) => this._handleJoinRoom(data, socket));
        socket.on('leave-project', (data: leaveProjectData) => this._handleLeaveRoom(data, socket));
        socket.on('code-update', (data: updateCodeData) => this._handleCodeUpdate(data, socket));
        socket.on('code-delta', (data: CodeDeltaData) => this._handleCodeDelta(data, socket));
        socket.on('notify-role-change', (data: updateRoleData) => this._handleUpdateRole(data, socket));
        socket.on('cursor-update', (data: CursorUpdateData) => this._handleCursorUpdate(data, socket));
        socket.on('cursor-remove', (data: { projectId: string, userId: string }) => {
            if (data.projectId && data.userId) {
                socket.to(data.projectId).emit('cursor-remove', { userId: data.userId });
            }
        });

    }

    public onDisconnect(socket: Socket): void {
        const projectId = socket.data.projectId;
        const userId = socket.data.userId;
        if (projectId && userId) {
            this._handleLeaveRoom({ projectId, userId, userName: '' }, socket);
        }
    }

    private async _handleJoinRoom(data: JoinProjectData, client: Socket): Promise<void> {
        const onlineUsers = await this._editorService.joinRoom(data.projectId, data.userId, client.id);
        client.join(data.projectId);
        client.data.projectId = data.projectId;
        client.data.userId = data.userId;

        let userMeta = await redis.hgetall(`userMeta:${data.userId}`);

        if (!userMeta || !userMeta.color) {
            const color = await this._getAvailableColor();
            await redis.hset(`userMeta:${data.userId}`, {
                name: data.userName,
                color
            });
            userMeta = { name: data.userName, color };
        }

        const color = userMeta.color;

        client.emit('user-info', { userId: data.userId, userName: data.userName, color });
        client.emit('online-users', onlineUsers);
        client.to(data.projectId).emit('online-users', onlineUsers);
        client.to(data.projectId).emit('user-joined', { message: `${data.userName} Joined` });

        console.log(`User ${data.userName} joined with color ${color}`);
    }

    private async _handleLeaveRoom(data: leaveProjectData, client: Socket): Promise<void> {
        const { projectId, userId } = data;

        // Remove user meta from Redis
        await redis.del(`userMeta:${userId}`);

        const onlineUsers = await this._editorService.leaveRoom(projectId, userId, client.id);
        client.leave(projectId);
        client.to(projectId).emit('online-users', onlineUsers);
        client.to(projectId).emit('user-left', { message: `${data.userName} left the editor.` });

        client.to(projectId).emit("cursor-remove", { userId });

    }

    private async _handleCodeUpdate(data: updateCodeData, client: Socket): Promise<void> {
        const { userId, projectId, content, ranges } = data;

        const room = await this._editorService.getRoomByProjectId(projectId);
        if (!room) {
            return;
        }

        const isOwner = room.owner.toString() === userId;
        const collaborator = room.collaborators.find(c => {
            const uId = (c.user as any)?._id ? (c.user as any)._id.toString() : c.user?.toString();
            return uId === userId;
        });
        const role = isOwner ? 'owner' : collaborator?.role;

        if (role === 'owner' || role === 'editor') {
            client.to(projectId).emit('code-update', { content, userId, ranges });
        }
    }

    private async _handleUpdateRole(data: updateRoleData, socket: Socket): Promise<void> {
        const { userId, role, projectId } = data;

        if (role === 'viewer') {
            this.io.to(projectId).emit('cursor-remove', { userId });
        }

        // Notify user via user room (all connected sockets for this user)
        this.io.to(`user:${userId}`).emit('updated-role', { message: `Your permission changed to ${role}` });
        this.io.to(`user:${userId}`).emit('refetch-permission');

        // Also notify the project room
        this.io.to(projectId).emit('refetch-permission');

        const targetSocketId = await this._editorService.getSocketIdByUserId(userId, projectId);
        if (targetSocketId) {
            this.io.to(targetSocketId).emit('updated-role', { message: `Your permission changed to ${role}` });
            this.io.to(targetSocketId).emit('refetch-permission');
        }
    }

    private async _getAvailableColor(): Promise<string> {
        const keys = await redis.keys('userMeta:*');
        const colors = new Set<string>();

        for (const key of keys) {
            const color = await redis.hget(key, 'color');
            if (color) colors.add(color);
        }

        for (const color of COLOR_PALETTE) {
            if (!colors.has(color)) return color;
        }

        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    private async _handleCodeDelta(data: CodeDeltaData, client: Socket): Promise<void> {
        const { userId, projectId, range, text } = data;
        if (!projectId || !userId || !range) return;

        // Broadcast code delta to all other collaborators in project room
        client.to(projectId).emit('code-delta', { userId, range, text });
    }

    private async _handleCursorUpdate(data: CursorUpdateData, socket: Socket) {
        const { projectId, userId, position, line } = data;
        if (!projectId || !userId) return;

        const room = await this._editorService.getRoomByProjectId(projectId);
        if (room) {
            const isOwner = room.owner.toString() === userId;
            const collaborator = room.collaborators.find(c => {
                const uId = (c.user as any)?._id ? (c.user as any)._id.toString() : c.user?.toString();
                return uId === userId;
            });
            const role = isOwner ? 'owner' : collaborator?.role;

            if (role === 'viewer') {
                socket.to(projectId).emit('cursor-remove', { userId });
                return;
            }
        }

        const lineNumber = position?.lineNumber ?? line ?? 1;
        const column = position?.column ?? 1;

        const userMeta = await redis.hgetall(`userMeta:${userId}`);
        const name = userMeta.name || 'Unknown';
        const color = userMeta.color || '#000000';

        // Broadcast to everyone else in the room
        socket.to(projectId).emit('cursor-update', {
            userId,
            userName: name,
            color,
            line: lineNumber,
            position: { lineNumber, column }
        });
    }

}
