import { Server, Socket } from "socket.io";
import { RequestData } from "../types/roomTypes";
import { roomRepositories } from "../repositories/roomRepositories";
import { requestService } from "../services/requestServices";



const userSocketMap = new Map<string, string>();

export default function roomSocket(io: Server, socket: Socket) {

    // Save socket connection
    socket.on("register-user", (userId: string) => {
        userSocketMap.set(userId, socket.id)
        console.log(`User registered: ${userId} => ${socket.id}`)
    })

    // Step 1: User send join request
    socket.on("join-request", async (data: RequestData) => {
        const { roomId, userId, userName } = data;

        const room = await roomRepositories.findRoomById(roomId);
        if (!room) {
            return socket.emit("error", "Room not found");
        }

        try {
            await requestService.createRequest({ roomId, senderId: userId })

            const ownerSocketId = userSocketMap.get(room.owner.toString());
            if (ownerSocketId) {
                io.to(ownerSocketId).emit("approve-request", { roomId, userId, userName });
            }
            socket.emit("request-sent", "Your join request has been sent!");
        } catch (err) {
            console.log(err)
            socket.emit("error", "Failed to send join request.");
        }
    });


    // Step 2: Owner approve the user
    socket.on("approve-user", async (data: RequestData) => {
        const { roomId, userId } = data

        const room = await roomRepositories.addUserToCollabrators(userId, roomId)

        // and update status in request

        if (!room) {
            return socket.emit("error", "Room not found, or update failed!")
        }

        const approvedUser = userSocketMap.get(userId)
        if (approvedUser) {
            io.to(approvedUser).emit("join-approved", { message: `approved your request. You can now start collaborating with.`, roomId })
        }

        io.in(roomId).emit("New collabrator added")
    })

    // Join the room (after approval) 
    socket.on("join-room", (roomId: string) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined the room : ${roomId}`)
    })

    // Clean up when user disconnects
    socket.on("disconnect", () => {
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socket.id === socketId) {
                userSocketMap.delete(userId)
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    })


}
