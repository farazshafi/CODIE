import { Server } from "socket.io";
import roomSocket from "./roomSocket";

export default function socketMain(io: Server) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Room related socket events
    roomSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
