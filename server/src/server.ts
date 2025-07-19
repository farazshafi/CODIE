import http from 'http';
import app from './app';
import { ENV } from './config/env';
import connectDB from './db';
import { SocketManager } from './sockets/SocketManager';

const PORT = ENV.PORT;

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);
        const socketManager = new SocketManager(server);
        socketManager.initialize();

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`.green);
        });

    } catch (error) {
        console.error("MongoDB connection failed:".red, error);
        process.exit(1);
    }
};

startServer();
