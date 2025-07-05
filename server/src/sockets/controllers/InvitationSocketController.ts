import { Socket } from "socket.io";
import { IUserSocketRepository } from "../repositories/interface/IUserSocketRepository";
import { IRoomSocketService } from "../services/interface/IRoomSocketService";


export class InvitationSocketController {
    constructor(
        private readonly roomSocketService: IRoomSocketService,
        private readonly userSocketRepository: IUserSocketRepository,
    ) { }

    async handleApproveInvitation(data: { invitationId: string, roomId: string, projectId: string }, socket: Socket) {
        try {
            const userId = this.userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this.roomSocketService.handleApproveInvitation(data)
            console.log("result: ".bgYellow, result)
            if (result.error) {
                return socket.emit("error", result.error);
            }

            if (result.senderId) {
                const userSocketId = this.userSocketRepository.getSocketId(result.senderId);
                if (userSocketId && result.reciverName) {
                    // Notify sender that invitation was accepted
                    socket.to(userSocketId).emit("join-invitation-approved", {
                        message: `${result.reciverName} has accepted Invitation`,
                        roomId: result.roomId
                    });

                    // Update notifications for the invitation sender
                    socket.to(userSocketId).emit("notification-received", {
                        type: "invitation",
                        action: "accepted"
                    });
                }

                // Update notifications for the accepter
                socket.emit("notification-received", {
                    type: "invitation",
                    action: "processed"
                });

                socket.emit("invitation-accepted-success", {
                    message: "You have successfully joined the room.",
                    roomId: result.roomId
                });

                // Notify all room members to update contributors list
                socket.to(result.projectId).emit("contributors-updated", {
                    message: "A new member has joined the room.",
                    roomId: result.roomId
                });
            }

        } catch (err) {
            console.log("Error while approving invitation", err)
            socket.emit("error", "Approval failed");
        }
    }
    async handleRejectInvitation(data: { invitationId: string, roomId: string }, socket: Socket) {
        try {
            const userId = this.userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this.roomSocketService.handleRejectInvitation(data)

            if (result.error) {
                return socket.emit("error", result.error);
            }

            if (result.senderId) {
                const userSocketId = this.userSocketRepository.getSocketId(result.senderId);
                if (userSocketId && result.reciverName) {
                    // Notify sender that invitation was rejected
                    socket.to(userSocketId).emit("join-invitation-rejected", {
                        message: `${result.reciverName} has rejected Invitation`,
                        roomId: result.roomId
                    });

                    // Update notifications for the invitation sender
                    socket.to(userSocketId).emit("notification-received", {
                        type: "invitation",
                        action: "rejected"
                    });
                }

                // Update notifications for the rejecter
                socket.emit("notification-received", {
                    type: "invitation",
                    action: "processed"
                });
            }

        } catch (err) {
            console.log("Error while rejecting invitation", err)
            socket.emit("error", "Rejection failed");
        }
    }
    async sendInvitation(data: { reciverId: string, roomId: string, senderName: string }, socket: Socket) {
        try {
            const userId = this.userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const userSocketId = this.userSocketRepository.getSocketId(data.reciverId);
            if (userSocketId) {
                // Notify receiver about the invitation
                socket.to(userSocketId).emit("recive-invitation", {
                    message: `You received an invitation from ${data.senderName} to join room: ${data.roomId}`,
                    roomId: data.roomId,
                    senderId: userId
                });

                // Update notifications for invitation receiver
                socket.to(userSocketId).emit("notification-received", {
                    type: "invitation",
                    action: "received"
                });
            }

            // Notify sender that invitation was sent
            socket.emit("invitation-sent", {
                message: "Invitation sent successfully",
                receiverId: data.reciverId
            });

            // Update sender's notifications too
            socket.emit("notification-received", {
                type: "invitation",
                action: "sent"
            });

        } catch (err) {
            console.log("Error while sending invitation", err)
            socket.emit("error", "Failed to send invitation");
        }
    }
}