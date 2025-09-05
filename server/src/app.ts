import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
import projectRouter from "./routes/projectRouter";
import roomRouter from "./routes/roomRouter";
import { setupGraphQl } from "./graphql";
import { errorHandler } from "./middlewares/errorHandler";
import requestRouter from "./routes/requestRouter";
import cookieParser from "cookie-parser"
import colors from 'colors';
import invitationRouter from "./routes/invitationRouter";
import adminRouter from "./routes/adminRouter";
import subscriptionRouter from "./routes/subscriptionRouter";
import messageRouter from "./routes/messageRouter";
import discoverRouter from "./routes/discoverRouter";
import userSubscriptionRouter from "./routes/userSubscriptionRouter";
import paymentRouter from "./routes/paymentRouter";
import { scheduleSubscriptionJobs } from "./bullmq/schedulers/subscriptionScheduler";
import starredRouter from "./routes/StarredRouter";

const app = express();
scheduleSubscriptionJobs()

// Middlewares
app.use(cors({
  origin: [`${process.env.CLIENT_URL}`, `${process.env.GRAPHQL_API}`],
  credentials: true
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
colors.enable()

// User Routes
app.use("/api", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/room", roomRouter);
app.use("/api/message", messageRouter);
app.use("/api/request", requestRouter);
app.use("/api/invitation", invitationRouter);
app.use("/api/subscription", subscriptionRouter)
app.use("/api/discover", discoverRouter)
app.use("/api/userSubscription", userSubscriptionRouter)
app.use("/api/starred", starredRouter)

// Admin Routes
app.use("/api/admin", adminRouter)
app.use("/api/payment", paymentRouter)

// GraphQL Setup
setupGraphQl(app);

// Error Handler
app.use(errorHandler);

export default app;
