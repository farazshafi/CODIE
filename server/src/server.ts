import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import connectDB from './db';
import socketMain from './sockets';

const PORT = ENV.PORT;

const startServer = async () => {
    try {
        await connectDB(); 

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        socketMain(io);

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); 
    }
};

startServer();
