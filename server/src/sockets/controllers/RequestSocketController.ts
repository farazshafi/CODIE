import { Socket } from "socket.io";
import { RequestData } from "../../types/roomTypes";
import { IRoomSocketService } from "../services/interface/IRoomSocketService";
import { ApproveRequestData } from "../../types/socketType";
import { IUserSocketRepository } from "../repositories/interface/IUserSocketRepository";


export class RequestSocketController {
    constructor(
        private readonly roomSocketService: IRoomSocketService,
        private readonly userSocketRepository: IUserSocketRepository
    ) { }

    async handleJoinRequest(data: RequestData, socket: Socket) {
        try {
            const result = await this.roomSocketService.handleJoinRequest(data);
            if ("error" in result) {
                socket.emit("error", result.error);
                return;
            }

            if (result.ownerSocketId) {
                // Send notification to room owner
                socket.to(result.ownerSocketId).emit("approve-request", {
                    roomId: data.roomId,
                    userId: data.userId,
                    userName: data.userName,
                    reqId: result.requestId,
                    message: `New join request received from ${data.userName} to join Room: ${data.roomId}`
                });

                // Emit notification update event
                socket.to(result.ownerSocketId).emit("notification-received", {
                    type: "request",
                    action: "received"
                });
            }

            // Notify requester that request was sent
            socket.emit("request-sent", { message: "Your join request has been sent!" });


            // Update sender's notifications too
            socket.emit("notification-received", {
                type: "request",
                action: "sent"
            });
        } catch (err) {
            console.log(err)
            socket.emit("error", "Failed to send join request.");
        }
    }

    async handleApproveRequest(data: ApproveRequestData, socket: Socket) {
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
                    socket.to(userSocketId).emit("join-approved", {
                        message: "Request accepted",
                        roomId: result.roomId
                    });

                    // Update notifications for the approved user
                    socket.to(userSocketId).emit("notification-received", {
                        type: "request",
                        action: "approved"
                    });

                    socket.emit("update-request", "true")
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
    }

    async handleReject(data: ApproveRequestData, socket: Socket) {
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
                    socket.to(userSocketId).emit("join-rejected", {
                        message: "Request Rejected",
                        roomId: result.roomId
                    });

                    // Update notifications for the rejected user
                    socket.to(userSocketId).emit("notification-received", {
                        type: "request",
                        action: "rejected"
                    });

                    socket.emit("update-request", "true")
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
    }
}