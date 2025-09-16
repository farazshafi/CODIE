import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IEditorService } from '../services/interface/IEditorService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { IOnlineUserRepository } from '../repositories/interface/IOnlineUserRepository';
import { JoinProjectData, leaveProjectData, updateCodeData, updateRoleData } from '../../types/socketType';
import redis from '../../config/redis';

/** Helper functions for lock ranges */
function parseRange(range: string): [number, number] {
    if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        return [start, end];
    }
    const num = Number(range);
    return [num, num];
}

function isOverlap(rangeA: [number, number], rangeB: [number, number]): boolean {
    return rangeA[0] <= rangeB[1] && rangeB[0] <= rangeA[1];
}

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
        socket.on('notify-role-change', (data: updateRoleData) => this._handleUpdateRole(data, socket));

        // lock system
        socket.on('lock:request', (data: { projectId: string, userId: string, ranges: string[], type: 'manual' }) => this._handleLockRequest(data, socket));
        socket.on('lock:release', (data: { projectId: string, userId: string, ranges: string[] }) => this._handleLockRelease(data, socket));
        socket.on('get-locked-lines', (data: { projectId: string }) => this._handleGetLockedLines(data, socket));
        socket.on('cursor-update', (data: { projectId: string, userId: string, line: number }) => this._handleCursorUpdate(data, socket));

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

        // Remove locks owned by this user
        const lockKey = `lineLocks:${projectId}`;
        const allLocks = await redis.hgetall(lockKey);
        for (const [range, owner] of Object.entries(allLocks)) {
            if (owner.startsWith(userId)) {
                await redis.hdel(lockKey, range);
                client.to(projectId).emit('lock:released', { range, userId });
            }
        }

        const onlineUsers = await this._editorService.leaveRoom(projectId, userId, client.id);
        client.leave(projectId);
        client.to(projectId).emit('online-users', onlineUsers);
        client.to(projectId).emit('user-left', { message: `${data.userName} left the editor.` });

        client.to(projectId).emit("cursor-remove", { userId });

    }

    private async _handleCodeUpdate(data: updateCodeData, client: Socket): Promise<void> {
        const { userId, projectId, content, ranges } = data;
        const lockKey = `lineLocks:${projectId}`;

        const allLocks = await redis.hgetall(lockKey);

        // Check for conflicts
        for (const r of ranges) {
            const editRange: [number, number] = r.includes('-') ? parseRange(r) : [Number(r), Number(r)];
            for (const [lockedRangeStr, val] of Object.entries(allLocks)) {
                const [ownerId] = val.split('|');
                const lockedRange = parseRange(lockedRangeStr);
                if (isOverlap(editRange, lockedRange) && ownerId !== userId) {
                    client.emit('error', { message: `Lines ${r} are locked by another user` });
                    return;
                }
            }
        }

        const room = await this._editorService.getRoomByProjectId(projectId);
        if (!room) {
            return;
        }

        const isOwner = room.owner.toString() === userId;
        const collaborator = room.collaborators.find(c => c.user._id.equals(userId));
        const role = isOwner ? 'owner' : collaborator?.role;

        if (role === 'owner' || role === 'editor') {
            client.to(projectId).emit('code-update', { content, userId, ranges });
        }
    }

    private async _handleUpdateRole(data: updateRoleData, socket: Socket): Promise<void> {
        const { userId, role, projectId } = data;
        const isUserOnline = await this._editorService.isUserOnline(projectId, userId);
        if (!isUserOnline) {
            socket.emit('error', { message: 'user to update not in online' });
            return;
        }
        const targetSocketId = await this._editorService.getSocketIdByUserId(userId, projectId);
        if (!targetSocketId) {
            socket.emit('error', { message: 'targetted socket not found' });
            return;
        }
        socket.to(targetSocketId).emit('updated-role', { message: `Your permission changed to ${role}` });
        socket.to(targetSocketId).emit('refetch-permission');
        console.log("refetch permission sedned".yellow)
    }

    private async _handleLockRequest(data: { projectId: string, userId: string, ranges: string[], type: 'manual' }, socket: Socket) {
        const { projectId, userId, type } = data;
        const ranges = Array.isArray(data.ranges) ? data.ranges : [data.ranges];

        const lockKey = `lineLocks:${projectId}`;
        const existingLocksRaw = await redis.hgetall(lockKey);
        const existingLocks: { range: [number, number]; owner: string; type: string }[] = [];

        for (const [rangeStr, val] of Object.entries(existingLocksRaw)) {
            const [owner, lockType] = val.split('|');
            existingLocks.push({ range: parseRange(rangeStr), owner, type: lockType });
        }

        const grantedRanges: string[] = [];

        for (const r of ranges) {
            let range = parseRange(r);
            let conflict = false;
            for (const lock of existingLocks) {
                if (isOverlap(range, lock.range) && lock.owner !== userId) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) {
                socket.emit('lock:denied', { range: r, lockedBy: 'another user' });
                continue;
            }

            const userLocks = existingLocks.filter(l => l.owner === userId);
            for (const ul of userLocks) {
                if (isOverlap(range, ul.range) || range[0] === ul.range[1] + 1 || range[1] + 1 === ul.range[0]) {
                    range = [Math.min(range[0], ul.range[0]), Math.max(range[1], ul.range[1])];
                    await redis.hdel(lockKey, `${ul.range[0]}-${ul.range[1]}`);
                }
            }

            await redis.hset(lockKey, `${range[0]}-${range[1]}`, `${userId}|${type}`);
            grantedRanges.push(`${range[0]}-${range[1]}`);
        }

        for (const r of grantedRanges) {
            const userMeta = await redis.hgetall(`userMeta:${userId}`);
            const name = userMeta.name || 'Unknown';
            const color = userMeta.color || '#000000';
            socket.emit('lock:granted', { range: r, userId, userName: name, color, type });
            socket.to(projectId).emit('lock:granted', { range: r, userId, userName: name, color, type });
        }
    }
    private async _handleLockRelease(data: { projectId: string, userId: string, ranges: string[] }, socket: Socket) {
        const { projectId, userId, ranges } = data;
        const lockKey = `lineLocks:${projectId}`;

        for (const range of ranges) {
            const existing = await redis.hget(lockKey, range);
            if (existing?.startsWith(userId)) {
                await redis.hdel(lockKey, range);
                socket.emit('lock:released', { range, userId });
                socket.to(projectId).emit('lock:released', { range, userId });
            }
        }
    }

    private async _handleGetLockedLines(data: { projectId: string }, socket: Socket) {
        const { projectId } = data;
        const lockKey = `lineLocks:${projectId}`;
        const existingLocksRaw = await redis.hgetall(lockKey);
        const locks: { range: string; userId: string; type: string; userName: string; color: string }[] = [];

        for (const [range, val] of Object.entries(existingLocksRaw)) {
            const [owner, lockType] = val.split('|');
            const userMeta = await redis.hgetall(`userMeta:${owner}`);
            locks.push({
                range,
                userId: owner,
                userName: userMeta.name || 'Unknown',
                color: userMeta.color || '#000000',
                type: lockType
            });
        }

        socket.emit('locked-lines', { projectId, locks });
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

    private async _handleCursorUpdate(data: { projectId: string, userId: string, line: number }, socket: Socket) {
        const { projectId, userId, line } = data;

        const userMeta = await redis.hgetall(`userMeta:${userId}`);
        const name = userMeta.name || 'Unknown';
        const color = userMeta.color || '#000000';

        // Broadcast to everyone else in the room
        socket.to(projectId).emit('cursor-update', { userId, userName: name, color, line });

        console.log(`cursor Broadcasted: ${name} with line ${line}, labeled as: ${color} color`)
    }

}
