import http from 'http';
import app from './app';
import { ENV } from './config/env';
import connectDB from './db';
import { SocketManager } from './sockets/SocketManager';
import { logger } from './utils/logger';

import { scheduleSubscriptionJobs } from './bullmq/schedulers/subscriptionScheduler';
import './bullmq/workers/subscriptionWorker'; // Import starts the worker side-effect

const PORT = ENV.PORT;

const startServer = async () => {
    try {
        await connectDB();
        
        // Start BullMQ Schedulers
        await scheduleSubscriptionJobs();

        const server = http.createServer(app);

        const socketManager = new SocketManager(server);
        socketManager.initialize();

        server.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        logger.error({ err: error }, "MongoDB connection failed:");
        process.exit(1);
    }
};

startServer();
