

//     socket.on("reject-user", async (data: RequestData) => {
//         const { requestId } = data;

//         await requestRepo.updateRequestStatus("rejected", requestId);

//         const requestedUser = await requestService.getRequestedUser(requestId, "sender")

//         if (!requestedUser) {
//             return socket.emit("error", "Request not found.");
//         }

//         const rejectedUser = userSocketMap.get(requestedUser)

//         if (rejectedUser) {
//             io.to(rejectedUser).emit("join-rejected", { message: "Your request to join the room has been rejected." });
//         }

//     })

//     // Join the room (after approval) 
//     socket.on("join-room", (roomId: string) => {
//         socket.join(roomId)
//         console.log(`Socket ${socket.id} joined the room : ${roomId}`)
//     })

//     // Clean up when user disconnects
//     socket.on("disconnect", () => {
//         for (const [userId, socketId] of userSocketMap.entries()) {
//             if (socket.id === socketId) {
//                 userSocketMap.delete(userId)
//                 console.log(`User disconnected: ${userId}`);
//                 break;
//             }
//         }
//     })


// }
