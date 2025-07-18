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


const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "https://studio.apollographql.com"],
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

// Admin Routes
app.use("/api/admin", adminRouter)

// GraphQL Setup
setupGraphQl(app);

// Error Handler
app.use(errorHandler);

export default app;
