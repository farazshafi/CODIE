import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import connectDB from './db';
import { setupSocket } from './sockets/socketServer';

const PORT = ENV.PORT;

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        setupSocket(io);

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`.green);
        });

    } catch (error) {
        console.error("MongoDB connection failed:".red, error);
        process.exit(1);
    }
};

startServer();
