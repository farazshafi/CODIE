import { Server, Socket } from "socket.io";
import { RequestData } from "../types/roomTypes";
import { roomRepositories } from "../repositories/roomRepositories";
import { requestService } from "../services/requestServices";
import { requestRepo } from "../repositories/requestRepositories";
import { HttpError } from "../utils/HttpError";



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

        const existingRequest = await requestRepo.findRequestByUserAndRoom(userId, roomId);
        if (existingRequest) {
            return socket.emit("error", "You have already sent a request to join this room.");
        }

        try {
            const request = await requestService.createRequest({ roomId, senderId: userId });
            const ownerSocketId = userSocketMap.get(room.owner.toString());
            if (ownerSocketId) {
                io.to(ownerSocketId).emit("approve-request", { roomId, userId, userName, reqId: request._id });
            }
            socket.emit("request-sent", "Your join request has been sent!");
        } catch (err) {
            console.log(err);
            socket.emit("error", "Failed to send join request.");
        }
    });


    // Step 2: Owner approves the user
    socket.on("approve-user", async (data: RequestData) => {
        const { roomId, requestId } = data;

        const room = await roomRepositories.findRoomById(roomId);
        if (!room) {
            return socket.emit("error", "Room not found!");
        }

        const requestedUser = await requestService.getRequestedUser(requestId, "sender")

        if (room.collaborators.some(collaborator => collaborator.user?.toString() === requestedUser)) {
            return socket.emit("error", "User is already a collaborator.");
        }

        const updatedRoom = await roomRepositories.addUserToCollabrators(requestedUser, roomId);

        await requestRepo.updateRequestStatus("accepted", requestId);

        if (!updatedRoom) {
            return socket.emit("error", "Failed to update the room with new collaborator.");
        }

        const approvedUser = userSocketMap.get(requestedUser);
        if (approvedUser) {
            io.to(approvedUser).emit("join-approved", { message: `Your request has been accepted. You can now start collaborating.`, roomId });
        }

        io.in(roomId).emit("New collaborator added");
    });

    socket.on("reject-user", async (data: RequestData) => {
        const { requestId } = data;

        await requestRepo.updateRequestStatus("rejected", requestId);

        const requestedUser = await requestService.getRequestedUser(requestId, "sender")

        if (!requestedUser) {
            return socket.emit("error", "Request not found.");
        }

        const rejectedUser = userSocketMap.get(requestedUser)

        if (rejectedUser) {
            io.to(rejectedUser).emit("join-rejected", { message: "Your request to join the room has been rejected." });
        }

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
