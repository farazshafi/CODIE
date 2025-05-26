import { Socket } from "socket.io";
import { IUserSocketService } from "../services/interface/IUserSocketService";



export class UserSocketController {
    constructor(
        private readonly userSocketService: IUserSocketService
    ) { }

    async handleBlockUser(userId: string, socket: Socket) {
        const userSocket = await this.userSocketService.getSocketId(userId)
        if (!userSocket) return
        socket.to(userSocket).emit("user-blocked", { message: "You are Blocked!" })
    }
}