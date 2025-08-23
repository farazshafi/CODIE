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

        // lock system
        socket.on('lock:request', (data: { projectId: string, userId: string, ranges: string[], type: 'manual' }) => this.handleLockRequest(data, socket));
        socket.on('lock:release', (data: { projectId: string, userId: string, ranges: string[] }) => this.handleLockRelease(data, socket));
    }

    public onDisconnect(socket: Socket): void {
        const projectId = socket.data.projectId;
        const userId = socket.data.userId;
        if (projectId && userId) {
            this.handleLeaveRoom({ projectId, userId, userName: '' }, socket);
        }
    }

    private async handleJoinRoom(data: JoinProjectData, client: Socket): Promise<void> {
        const onlineUsers = await this.editorService.joinRoom(data.projectId, data.userId, client.id);
        client.join(data.projectId);
        client.emit('online-users', onlineUsers);
        client.to(data.projectId).emit('online-users', onlineUsers);
        client.to(data.projectId).emit('user-joined', { message: `A user Joined` });
        client.data.projectId = data.projectId;
        client.data.userId = data.userId;
    }

    private async handleLeaveRoom(data: leaveProjectData, client: Socket): Promise<void> {
        const { projectId, userId } = data;

        // Cleanup user locks on disconnect
        const lockKey = `lineLocks:${projectId}`;
        const allLocks = await redis.hgetall(lockKey);
        for (const [range, owner] of Object.entries(allLocks)) {
            if (owner.startsWith(userId)) {
                await redis.hdel(lockKey, range);
                client.to(projectId).emit('lock:released', { range, userId });
            }
        }

        // Existing leave logic
        const onlineUsers = await this.editorService.leaveRoom(projectId, userId, client.id);
        client.leave(projectId);
        client.to(projectId).emit('online-users', onlineUsers);
        client.to(projectId).emit('user-left', { message: `${data.userName} left the editor.` });
    }

    private async handleCodeUpdate(data: updateCodeData, client: Socket): Promise<void> {
        console.log("updated requested Data".bgYellow, data)
        const { userId, projectId, content, range } = data;
        const lockKey = `lineLocks:${projectId}`;
        const owner = await redis.hget(lockKey, range);
        if (owner && !owner.startsWith(userId)) {
            client.emit('error', { message: 'Line locked by another user' });
            return;
        }

        const room = await this.editorService.getRoomByProjectId(projectId);
        console.log("comming here,room: ", room ? "room ind" : "null")
        if (!room) {
            client.emit('error', { message: 'Room not found' });
            return;
        }

        const isOwner = room.owner.toString() === userId;
        const collaborator = room.collaborators.find(c => c.user._id.equals(userId));
        const role = isOwner ? 'owner' : collaborator?.role;


        if (role === 'owner' || role === 'editor') {
            client.to(projectId).emit('code-update', { content, userId, range });
            console.log("sended back updated code")
        }
    }

    private async handleUpdateRole(data: updateRoleData, socket: Socket): Promise<void> {
        const { userId, role, projectId } = data;
        const isUserOnline = await this.editorService.isUserOnline(projectId, userId);
        if (!isUserOnline) {
            socket.emit('error', { message: 'user to update not in online' });
            return;
        }
        const targetSocketId = await this.editorService.getSocketIdByUserId(userId, projectId);
        if (!targetSocketId) {
            socket.emit('error', { message: 'targetted socket not found' });
            return;
        }
        socket.to(targetSocketId).emit('updated-role', { message: `Your permission changed to ${role}` });
        socket.to(targetSocketId).emit('refetch-permission');
        console.log("role upated")
    }

    /** Handle lock request with multiple ranges and merging */
    private async handleLockRequest(data: { projectId: string, userId: string, ranges: string[], type: 'manual' }, socket: Socket) {
        console.log("lock request comes Data:", data)
        const { projectId, userId, ranges, type } = data;
        const lockKey = `lineLocks:${projectId}`;

        const existingLocksRaw = await redis.hgetall(lockKey);
        const existingLocks: { range: [number, number]; owner: string; type: string }[] = [];
        for (const [rangeStr, val] of Object.entries(existingLocksRaw)) {
            const [owner, lockType] = val.split('|');
            existingLocks.push({ range: parseRange(rangeStr), owner, type: lockType });
        }

        console.log("existing locks:", existingLocks)

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

            // Merge with existing user locks if contiguous
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

        grantedRanges.forEach(r => {
            socket.emit('lock:granted', { range: r, userId, type });
            socket.to(projectId).emit('lock:granted', { range: r, userId, type });
        });

        console.log("Granded ragnes: ", grantedRanges)
    }

    /** Release multiple locks */
    private async handleLockRelease(data: { projectId: string, userId: string, ranges: string[] }, socket: Socket) {
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
}
