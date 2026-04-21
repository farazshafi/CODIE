import express from "express";
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
import starredRouter from "./routes/StarredRouter";
import { attachLogger } from "./utils/loggerContext";
import commentRouter from "./routes/commentRouter";
import executeRouter from "./routes/executeRouter";

const app = express();

// Fully permissive CORS for quick local testing.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(attachLogger)
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
app.use("/api/comment", commentRouter)
app.use("/api/execute", executeRouter);

// Admin Routes
app.use("/api/admin", adminRouter)
app.use("/api/payment", paymentRouter)

// GraphQL Setup
setupGraphQl(app);

// Error Handler
app.use(errorHandler);

export default app;
