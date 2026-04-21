import http from 'http';
import app from './app';
import { ENV } from './config/env';
import connectDB from './db';
import { SocketManager } from './sockets/SocketManager';
import { logger } from './utils/logger';

const PORT = ENV.PORT;
const shouldRunBackgroundJobs = String(process.env.RUN_BACKGROUND_JOBS).toLowerCase() === "true";

const startServer = async () => {
    try {
        await connectDB();

        if (shouldRunBackgroundJobs) {
            await import("./bullmq/schedulers/subscriptionScheduler").then((module) => module.scheduleSubscriptionJobs());
            await import("./bullmq/workers/subscriptionWorker");
            logger.info("Embedded worker and scheduler enabled");
        } else {
            logger.info("Embedded worker and scheduler disabled (RUN_BACKGROUND_JOBS=false)");
        }

        const server = http.createServer(app);

        const socketManager = new SocketManager(server);
        socketManager.initialize();

        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (error) {
        logger.error({ err: error }, "MongoDB connection failed:");
        process.exit(1);
    }
};

startServer();
