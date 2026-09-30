import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import redis from '../../config/redis';

export interface JoinHuddleData {
    projectId: string;
    userId: string;
    userName?: string;
}

export interface LeaveHuddleData {
    projectId: string;
    userId: string;
}

export interface WebRTCSignalData {
    projectId: string;
    senderUserId: string;
    targetSocketId?: string;
    targetUserId?: string;
    offer?: any;
    answer?: any;
    candidate?: any;
}

export class WebRTCEvents implements IEventHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public register(socket: Socket): void {
        socket.on('webrtc:join-huddle', (data: JoinHuddleData) => this._handleJoinHuddle(data, socket));
        socket.on('webrtc:leave-huddle', (data: LeaveHuddleData) => this._handleLeaveHuddle(data, socket));
        socket.on('webrtc:offer', (data: WebRTCSignalData) => this._handleOffer(data, socket));
        socket.on('webrtc:answer', (data: WebRTCSignalData) => this._handleAnswer(data, socket));
        socket.on('webrtc:ice-candidate', (data: WebRTCSignalData) => this._handleIceCandidate(data, socket));
        socket.on('webrtc:speaking-state', (data: { projectId: string; userId: string; isSpeaking: boolean }) => {
            socket.to(data.projectId).emit('webrtc:speaking-state', data);
        });

        // Moderation & Hand Raise
        socket.on('webrtc:raise-hand', (data: { projectId: string; userId: string; userName?: string }) => {
            socket.to(data.projectId).emit('webrtc:hand-raised', data);
        });

        socket.on('webrtc:lower-hand', (data: { projectId: string; userId: string }) => {
            socket.to(data.projectId).emit('webrtc:hand-lowered', data);
        });

        socket.on('webrtc:mute-peer', (data: { projectId: string; targetUserId: string; targetSocketId?: string }) => {
            if (data.targetSocketId) {
                this.io.to(data.targetSocketId).emit('webrtc:force-muted', data);
            } else {
                socket.to(data.projectId).emit('webrtc:force-muted', data);
            }
        });

        socket.on('webrtc:mute-all', (data: { projectId: string }) => {
            socket.to(data.projectId).emit('webrtc:force-muted-all', data);
        });
    }

    public async onDisconnect(socket: Socket): Promise<void> {
        const projectId = socket.data.projectId;
        const userId = socket.data.userId;
        if (projectId && userId) {
            await this._handleLeaveHuddle({ projectId, userId }, socket);
        }
    }

    private async _handleJoinHuddle(data: JoinHuddleData, socket: Socket): Promise<void> {
        const { projectId, userId, userName } = data;
        const huddleKey = `huddle:${projectId}`;

        // Save socket data context
        socket.data.projectId = projectId;
        socket.data.userId = userId;

        // Store user in active huddle set in Redis
        await redis.hset(huddleKey, userId, JSON.stringify({
            socketId: socket.id,
            userId,
            userName: userName || 'Developer'
        }));

        // Fetch all current huddle users
        const allUsersRaw = await redis.hgetall(huddleKey);
        const huddleParticipants = Object.values(allUsersRaw).map(u => JSON.parse(u));

        // Notify existing members that a new user joined
        socket.to(projectId).emit('webrtc:user-joined-huddle', {
            userId,
            socketId: socket.id,
            userName: userName || 'Developer'
        });

        // Send current list of active huddle participants back to joining user
        socket.emit('webrtc:huddle-participants', huddleParticipants);
    }

    private async _handleLeaveHuddle(data: LeaveHuddleData, socket: Socket): Promise<void> {
        const { projectId, userId } = data;
        const huddleKey = `huddle:${projectId}`;

        await redis.hdel(huddleKey, userId);

        socket.to(projectId).emit('webrtc:user-left-huddle', {
            userId,
            socketId: socket.id
        });
    }

    private _handleOffer(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, offer, senderUserId, projectId } = data;
        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:offer', {
                offer,
                senderUserId,
                senderSocketId: socket.id
            });
        } else {
            socket.to(projectId).emit('webrtc:offer', {
                offer,
                senderUserId,
                senderSocketId: socket.id
            });
        }
    }

    private _handleAnswer(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, answer, senderUserId, projectId } = data;
        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:answer', {
                answer,
                senderUserId,
                senderSocketId: socket.id
            });
        } else {
            socket.to(projectId).emit('webrtc:answer', {
                answer,
                senderUserId,
                senderSocketId: socket.id
            });
        }
    }

    private _handleIceCandidate(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, candidate, senderUserId, projectId } = data;
        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:ice-candidate', {
                candidate,
                senderUserId,
                senderSocketId: socket.id
            });
        } else {
            socket.to(projectId).emit('webrtc:ice-candidate', {
                candidate,
                senderUserId,
                senderSocketId: socket.id
            });
        }
    }
}
