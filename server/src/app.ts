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
import cors from "cors";
import { getAllowedOrigins, isOriginAllowed } from "./config/origins";

const app = express();
const allowedOrigins = getAllowedOrigins();
const corsOptions: cors.CorsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS rejected origin: ${origin || "unknown"}`));
  },
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(attachLogger)
colors.enable()
if (!allowedOrigins.length) {
  console.warn("No CORS origins configured. Set CLIENT_URL and/or CORS_ORIGINS.");
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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
