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
                    this.io.to(result.ownerSocketId).emit("approve-request", {
                        roomId: data.roomId,
                        userId: data.userId,
                        userName: data.userName,
                        reqId: result.requestId
                    });
                }
                socket.emit("request-sent", "Your join request has been sent!");
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
                        this.io.to(userSocketId).emit("join-approved", {
                            message: "Request accepted",
                            roomId: result.roomId
                        });
                    }
                }

            } catch (err) {
                console.log("Error whiel approving user", err)
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
                        this.io.to(userSocketId).emit("join-approved", {
                            message: "Request Rejected",
                            roomId: result.roomId
                        });
                    }
                }

            } catch (err) {
                console.log("Error whiel approving user", err)
                socket.emit("error", "Approval failed");
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
                        this.io.to(userSocketId).emit("join-invitation-approved", {
                            message: `${result.reciverName} has accepted Invitation`,
                            roomId: result.roomId
                        });
                    }
                }

            } catch (err) {
                console.log("Error whiel approving user", err)
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
                        this.io.to(userSocketId).emit("join-invitation-rejected", {
                            message: `${result.reciverName} has rejected Invitation`,
                            roomId: result.roomId
                        });
                    }
                }

            } catch (err) {
                console.log("Error whiel approving user", err)
                socket.emit("error", "Approval failed");
            }
        });
    }

    sendInvitation(socket: Socket) {
        socket.on("send-invitation", async (data: { reciverId: string }) => {
            try {
                const userSocketId = this.userSocketRepository.getSocketId(data.reciverId);
                if (userSocketId) {
                    this.io.to(userSocketId).emit("recive-invitation", {
                        message: ` recived Invitation`,
                    });
                }


            } catch (err) {
                console.log("Error whiel approving user", err)
                socket.emit("error", "Approval failed");
            }
        })
    }

}