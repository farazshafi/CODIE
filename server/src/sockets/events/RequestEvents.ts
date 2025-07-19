
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IRoomSocketService } from '../services/interface/IRoomSocketService';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { RequestData } from '../../types/roomTypes';
import { ApproveRequestData } from '../../types/socketType';

export class RequestEvents implements IEventHandler {
    private io: Server;
    private roomSocketService: IRoomSocketService;
    private userSocketRepository: IUserSocketRepository;

    constructor(
        io: Server,
        roomSocketService: IRoomSocketService,
        userSocketRepository: IUserSocketRepository
    ) {
        this.io = io;
        this.roomSocketService = roomSocketService;
        this.userSocketRepository = userSocketRepository;
    }

    public register(socket: Socket): void {
        socket.on("join-request", (data: RequestData) => this.handleJoinRequest(data, socket));
        socket.on("approve-user", (data: ApproveRequestData) => this.handleApproveRequest(data, socket));
        socket.on("reject-user", (data: ApproveRequestData) => this.handleReject(data, socket));
    }

    private async handleJoinRequest(data: RequestData, socket: Socket): Promise<void> {
        try {
            const result = await this.roomSocketService.handleJoinRequest(data);
            if ("error" in result) {
                socket.emit("error", result.error);
                return;
            }

            if (result.ownerSocketId) {
                this.io.to(result.ownerSocketId).emit("approve-request", {
                    roomId: data.roomId,
                    userId: data.userId,
                    userName: data.userName,
                    reqId: result.requestId,
                    message: `New join request received from ${data.userName} to join Room: ${data.roomId}`
                });
                this.io.to(result.ownerSocketId).emit("notification-received", {
                    type: "request",
                    action: "received"
                });
            }

            socket.emit("request-sent", { message: "Your join request has been sent!" });
            socket.emit("notification-received", {
                type: "request",
                action: "sent"
            });
        } catch (err) {
            console.log(err);
            socket.emit("error", "Failed to send join request.");
        }
    }

    private async handleApproveRequest(data: ApproveRequestData, socket: Socket): Promise<void> {
        try {
            const userId = await this.userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this.roomSocketService.handleApproveUser({
                ...data,
                userId,
            });

            if (result.error) {
                socket.emit("error", result.error);
                return;
            }

            if (result.approvedUserId) {
                const userSocketId = await this.userSocketRepository.getSocketId(result.approvedUserId);
                const roomId = result.roomId;

                // Notify approved user
                if (userSocketId) {
                    this.io.to(userSocketId).emit("join-approved", {
                        message: "Request accepted",
                        roomId: roomId
                    });

                    this.io.to(userSocketId).emit("notification-received", {
                        type: "request",
                        action: "approved"
                    });

                    socket.emit("update-request", "true");
                }

                // Notify the approver (owner)
                socket.emit("notification-received", {
                    type: "request",
                    action: "processed"
                });


                // Emit to all users in the room to update contributors list
                this.io.to(result.projectId).emit("contributors-updated", {
                    message: "Contributors list updated",
                    roomId: roomId
                });

                console.log("after sending contributre update")

            }

        } catch (err) {
            console.log("Error while approving user", err);
            socket.emit("error", "Approval failed");
        }
    }


    private async handleReject(data: ApproveRequestData, socket: Socket): Promise<void> {
        try {
            const userId = await this.userSocketRepository.getUserId(socket.id);
            if (!userId) throw new Error("Unauthorized");

            const result = await this.roomSocketService.handleRejectUser(data);

            if (result.error) {
                socket.emit("error", result.error);
                return;
            }

            if (result.rejectedUserId) {
                const userSocketId = await this.userSocketRepository.getSocketId(result.rejectedUserId);
                if (userSocketId) {
                    this.io.to(userSocketId).emit("join-rejected", {
                        message: "Request Rejected",
                        roomId: result.roomId
                    });
                    this.io.to(userSocketId).emit("notification-received", {
                        type: "request",
                        action: "rejected"
                    });
                    socket.emit("update-request", "true");
                }

                socket.emit("notification-received", {
                    type: "request",
                    action: "processed"
                });
            }

        } catch (err) {
            console.log("Error while rejecting user", err);
            socket.emit("error", "Rejection failed");
        }
    }
}
