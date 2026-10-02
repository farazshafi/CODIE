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
            if (data.projectId) {
                socket.join(data.projectId);
                socket.to(data.projectId).emit('webrtc:speaking-state', data);
            }
        });

        socket.on('webrtc:video-state', (data: { projectId: string; userId: string; isVideoOn: boolean }) => {
            if (data.projectId) {
                socket.join(data.projectId);
                socket.to(data.projectId).emit('webrtc:video-state', data);
            }
        });

        // Moderation & Hand Raise
        socket.on('webrtc:raise-hand', (data: { projectId: string; userId: string; userName?: string }) => {
            if (data.projectId) {
                socket.join(data.projectId);
                socket.to(data.projectId).emit('webrtc:hand-raised', data);
            }
        });

        socket.on('webrtc:lower-hand', (data: { projectId: string; userId: string }) => {
            if (data.projectId) {
                socket.join(data.projectId);
                socket.to(data.projectId).emit('webrtc:hand-lowered', data);
            }
        });

        socket.on('webrtc:mute-peer', (data: { projectId: string; targetUserId: string; targetSocketId?: string }) => {
            if (data.projectId) {
                socket.join(data.projectId);
                if (data.targetSocketId) {
                    this.io.to(data.targetSocketId).emit('webrtc:force-muted', data);
                }
                socket.to(data.projectId).emit('webrtc:force-muted', data);
            }
        });

        socket.on('webrtc:mute-all', (data: { projectId: string }) => {
            if (data.projectId) {
                socket.join(data.projectId);
                socket.to(data.projectId).emit('webrtc:force-muted-all', data);
            }
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
        if (!projectId || !userId) return;

        const huddleKey = `huddle:${projectId}`;

        // Ensure socket joins socket.io project room
        socket.join(projectId);
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

        // Notify all members in the project room that a user joined the huddle
        this.io.to(projectId).emit('webrtc:user-joined-huddle', {
            userId,
            socketId: socket.id,
            userName: userName || 'Developer'
        });

        // Send current list of active huddle participants back to joining user
        socket.emit('webrtc:huddle-participants', huddleParticipants);
    }

    private async _handleLeaveHuddle(data: LeaveHuddleData, socket: Socket): Promise<void> {
        const { projectId, userId } = data;
        if (!projectId || !userId) return;

        const huddleKey = `huddle:${projectId}`;
        const userRaw = await redis.hget(huddleKey, userId);
        let userName = "Collaborator";
        if (userRaw) {
            try {
                const parsed = JSON.parse(userRaw);
                userName = parsed.userName || userName;
            } catch { }
        }
        await redis.hdel(huddleKey, userId);

        this.io.to(projectId).emit('webrtc:user-left-huddle', {
            userId,
            socketId: socket.id,
            userName
        });
    }

    private _handleOffer(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, targetUserId, offer, senderUserId, projectId } = data;
        if (!projectId) return;

        socket.join(projectId);

        const signalPayload = {
            offer,
            senderUserId,
            senderSocketId: socket.id,
            targetUserId,
            targetSocketId
        };

        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:offer', signalPayload);
        }
        socket.to(projectId).emit('webrtc:offer', signalPayload);
    }

    private _handleAnswer(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, targetUserId, answer, senderUserId, projectId } = data;
        if (!projectId) return;

        socket.join(projectId);

        const signalPayload = {
            answer,
            senderUserId,
            senderSocketId: socket.id,
            targetUserId,
            targetSocketId
        };

        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:answer', signalPayload);
        }
        socket.to(projectId).emit('webrtc:answer', signalPayload);
    }

    private _handleIceCandidate(data: WebRTCSignalData, socket: Socket): void {
        const { targetSocketId, targetUserId, candidate, senderUserId, projectId } = data;
        if (!projectId) return;

        socket.join(projectId);

        const signalPayload = {
            candidate,
            senderUserId,
            senderSocketId: socket.id,
            targetUserId,
            targetSocketId
        };

        if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc:ice-candidate', signalPayload);
        }
        socket.to(projectId).emit('webrtc:ice-candidate', signalPayload);
    }
}
