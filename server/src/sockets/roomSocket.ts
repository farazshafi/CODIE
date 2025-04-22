import { Server, Socket } from "socket.io";
import { JoinRequestData } from "../types/roomTypes";
import { roomRepositories } from "../repositories/roomRepositories";



const userSocketMap = new Map<string, string>();

export default function roomSocket(io: Server, socket: Socket) {

    // Save socket connection
    socket.on("register-user", (userId: string) => {
        userSocketMap.set(userId, socket.id)
        console.log(`User registered: ${userId} => ${socket.id}`)
    })

    // Step 1: User send join request
    socket.on("join-request", async (data: JoinRequestData) => {
        const { roomId, userId, userName } = data

        const room = await roomRepositories.findRoomById(roomId)
        if (!room) {
            return socket.emit("error", "Room not found")
        }

        const ownerSocketId = userSocketMap.get(room.owner.toString())
        if (ownerSocketId) {
            io.to(ownerSocketId).emit("approve-request", { roomId, userId, userName })
        }
    })

    // Step 2: Owner approve the user
    socket.on("approve-user", async (data: JoinRequestData) => {
        const { roomId, userId } = data

        const room = await roomRepositories.addUserToCollabrators(userId, roomId)

        if (!room) {
            return socket.emit("error", "Room not found, or update failed!")
        }

        const approvedUser = userSocketMap.get(userId)
        if (approvedUser) {
            io.to(approvedUser).emit("join-approved", "Owner approved your request. You can now start collaborating.")
        }

        io.in(roomId).emit("New collabrator added", room.collaborators)
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
