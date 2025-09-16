
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IRoomSocketService } from '../services/interface/IRoomSocketService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';

export class InvitationEvents implements IEventHandler {
    private io: Server;
    private _roomSocketService: IRoomSocketService;
    private _userSocketRepository: IUserSocketRepository;

    constructor(
        io: Server,
        _roomSocketService: IRoomSocketService,
        _userSocketRepository: IUserSocketRepository
    ) {
        this.io = io;
        this._roomSocketService = _roomSocketService;
        this._userSocketRepository = _userSocketRepository;
    }

    public register(socket: Socket): void {
        socket.on("send-invitation", (data) => this._sendInvitation(data, socket));
        socket.on("approve-invitation", (data) => this._handleApproveInvitation(data, socket));
        socket.on("reject-invitation", (data) => this._handleRejectInvitation(data, socket));
    }

    private async _handleApproveInvitation(data: { invitationId: string, roomId: string, projectId: string }, socket: Socket): Promise<void> {
        try {
            const userId = await this._userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this._roomSocketService.handleApproveInvitation(data);
            if (result.error) {
                socket.emit("error", result.error);
                return;
            }

            if (result.senderId) {
                const userSocketId = await this._userSocketRepository.getSocketId(result.senderId);
                if (userSocketId && result.reciverName) {
                    this.io.to(userSocketId).emit("join-invitation-approved", {
                        message: `${result.reciverName} has accepted Invitation`,
                        roomId: result.roomId
                    });
                    this.io.to(userSocketId).emit("notification-received", {
                        type: "invitation",
                        action: "accepted"
                    });
                }

                socket.emit("notification-received", {
                    type: "invitation",
                    action: "processed"
                });

                socket.emit("invitation-accepted-success", {
                    message: "You have successfully joined the room.",
                    roomId: result.roomId
                });

                this.io.to(result.projectId).emit("contributors-updated", {
                    message: "A new member has joined the room.",
                    roomId: result.roomId
                });
            }

        } catch (err) {
            console.log("Error while approving invitation", err);
            socket.emit("error", "Approval failed");
        }
    }

    private async _handleRejectInvitation(data: { invitationId: string, roomId: string }, socket: Socket): Promise<void> {
        try {
            const userId = await this._userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this._roomSocketService.handleRejectInvitation(data);

            if (result.error) {
                socket.emit("error", result.error);
                return;
            }

            if (result.senderId) {
                const userSocketId = await this._userSocketRepository.getSocketId(result.senderId);
                if (userSocketId && result.reciverName) {
                    this.io.to(userSocketId).emit("join-invitation-rejected", {
                        message: `${result.reciverName} has rejected Invitation`,
                        roomId: result.roomId
                    });
                    this.io.to(userSocketId).emit("notification-received", {
                        type: "invitation",
                        action: "rejected"
                    });
                }

                socket.emit("notification-received", {
                    type: "invitation",
                    action: "processed"
                });
            }

        } catch (err) {
            console.log("Error while rejecting invitation", err);
            socket.emit("error", "Rejection failed");
        }
    }

    private async _sendInvitation(data: { reciverId: string, roomId: string, senderName: string }, socket: Socket): Promise<void> {
        try {
            const userId = await this._userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const userSocketId = await this._userSocketRepository.getSocketId(data.reciverId);
            if (userSocketId) {
                this.io.to(userSocketId).emit("recive-invitation", {
                    message: `You received an invitation from ${data.senderName} to join room: ${data.roomId}`,
                    roomId: data.roomId,
                    senderId: userId
                });
                this.io.to(userSocketId).emit("notification-received", {
                    type: "invitation",
                    action: "received"
                });
            }

            socket.emit("invitation-sent", {
                message: "Invitation sent successfully",
                receiverId: data.reciverId
            });

            socket.emit("notification-received", {
                type: "invitation",
                action: "sent"
            });

        } catch (err) {
            console.log("Error while sending invitation", err);
            socket.emit("error", "Failed to send invitation");
        }
    }
    
}
