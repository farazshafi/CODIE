import { Server, Socket } from "socket.io";
import { RequestData } from "../../types/roomTypes";
import { IRoomSocketService } from "../services/interface/IRoomSocketService";
import { ApproveRequestData } from "../../types/socketType";
import { IUserSocketRepository } from "../repositories/interface/IUserSocketRepository";


export class RoomSocketController {
    constructor(
        private readonly io: Server,
        private readonly roomSocketService: IRoomSocketService,
        private readonly userSocketRepository: IUserSocketRepository,
    ) { }

    handleJoinRequest(socket: Socket) {
        socket.on("join-request", async (data: RequestData) => {
            try {
                const result = await this.roomSocketService.handleJoinRequest(data);
                if ("error" in result) {
                    socket.emit("error", result.error);
                    return;
                }

                if (result.ownerSocketId) {
                    // Send notification to room owner
                    this.io.to(result.ownerSocketId).emit("approve-request", {
                        roomId: data.roomId,
                        userId: data.userId,
                        userName: data.userName,
                        reqId: result.requestId
                    });
                    
                    // Emit notification update event
                    this.io.to(result.ownerSocketId).emit("notification-received", {
                        type: "request",
                        action: "received"
                    });
                }
                
                // Notify requester that request was sent
                socket.emit("request-sent", "Your join request has been sent!");
                
                // Update sender's notifications too
                socket.emit("notification-received", {
                    type: "request",
                    action: "sent"
                });
            } catch (err) {
                console.log(err)
                socket.emit("error", "Failed to send join request.");
            }
        });
    }

    handleApproveUser(socket: Socket) {
        socket.on("approve-user", async (data: ApproveRequestData) => {
            try {
                const userId = this.userSocketRepository.getUserId(socket.id);
                if (!userId) throw new Error("Unauthorized");

                const result = await this.roomSocketService.handleApproveUser({
                    ...data,
                    userId
                });

                if (result.error) {
                    return socket.emit("error", result.error);
                }

                if (result.approvedUserId) {
                    const userSocketId = this.userSocketRepository.getSocketId(result.approvedUserId);
                    if (userSocketId) {
                        // Notify user their request was approved
                        this.io.to(userSocketId).emit("join-approved", {
                            message: "Request accepted",
                            roomId: result.roomId
                        });
                        
                        // Update notifications for the approved user
                        this.io.to(userSocketId).emit("notification-received", {
                            type: "request",
                            action: "approved"
                        });
                    }
                    
                    // Update notifications for the approver
                    socket.emit("notification-received", {
                        type: "request",
                        action: "processed"
                    });
                }

            } catch (err) {
                console.log("Error while approving user", err)
                socket.emit("error", "Approval failed");
            }
        });
    }

    handleRejectUser(socket: Socket) {
        socket.on("reject-user", async (data: ApproveRequestData) => {
            try {
                const userId = this.userSocketRepository.getUserId(socket.id);
                if (!userId) throw new Error("Unauthorized");

                const result = await this.roomSocketService.handleRejectUser(data)

                if (result.error) {
                    return socket.emit("error", result.error);
                }

                if (result.rejectedUserId) {
                    const userSocketId = this.userSocketRepository.getSocketId(result.rejectedUserId);
                    if (userSocketId) {
                        // Notify user their request was rejected
                        this.io.to(userSocketId).emit("join-rejected", {
                            message: "Request Rejected",
                            roomId: result.roomId
                        });
                        
                        // Update notifications for the rejected user
                        this.io.to(userSocketId).emit("notification-received", {
                            type: "request",
                            action: "rejected"
                        });
                    }
                    
                    // Update notifications for the rejecter
                    socket.emit("notification-received", {
                        type: "request",
                        action: "processed"
                    });
                }

            } catch (err) {
                console.log("Error while rejecting user", err)
                socket.emit("error", "Rejection failed");
            }
        });
    }

    handleApproveInvitation(socket: Socket) {
        socket.on("approve-invitation", async (data: { invitationId: string, roomId: string }) => {
            try {
                const userId = this.userSocketRepository.getUserId(socket.id);
                if (!userId) throw new Error("Unauthorized");

                const result = await this.roomSocketService.handleApproveInvitation(data)

                if (result.error) {
                    return socket.emit("error", result.error);
                }

                if (result.senderId) {
                    const userSocketId = this.userSocketRepository.getSocketId(result.senderId);
                    if (userSocketId && result.reciverName) {
                        // Notify sender that invitation was accepted
                        this.io.to(userSocketId).emit("join-invitation-approved", {
                            message: `${result.reciverName} has accepted Invitation`,
                            roomId: result.roomId
                        });
                        
                        // Update notifications for the invitation sender
                        this.io.to(userSocketId).emit("notification-received", {
                            type: "invitation",
                            action: "accepted"
                        });
                    }
                    
                    // Update notifications for the accepter
                    socket.emit("notification-received", {
                        type: "invitation",
                        action: "processed"
                    });
                }

            } catch (err) {
                console.log("Error while approving invitation", err)
                socket.emit("error", "Approval failed");
            }
        });
    }

    handleRejectInvitation(socket: Socket) {
        socket.on("reject-invitation", async (data: { invitationId: string, roomId: string }) => {
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
                        this.io.to(userSocketId).emit("join-invitation-rejected", {
                            message: `${result.reciverName} has rejected Invitation`,
                            roomId: result.roomId
                        });
                        
                        // Update notifications for the invitation sender
                        this.io.to(userSocketId).emit("notification-received", {
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
        });
    }

    sendInvitation(socket: Socket) {
        socket.on("send-invitation", async (data: { reciverId: string, roomId: string, senderName: string }) => {
            try {
                const userId = this.userSocketRepository.getUserId(socket.id);
                if (!userId) throw new Error("Unauthorized");
                
                const userSocketId = this.userSocketRepository.getSocketId(data.reciverId);
                if (userSocketId) {
                    // Notify receiver about the invitation
                    this.io.to(userSocketId).emit("recive-invitation", {
                        message: `You received an invitation from ${data.senderName} to join room: ${data.roomId}`,
                        roomId: data.roomId,
                        senderId: userId
                    });
                    
                    // Update notifications for invitation receiver
                    this.io.to(userSocketId).emit("notification-received", {
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
        });
    }
}