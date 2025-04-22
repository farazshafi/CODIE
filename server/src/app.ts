import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
import projectRouter from "./routes/projectRouter";
import editorRouter from "./routes/editorRouter";
import roomRouter from "./routes/roomRouter";
import { setupGraphQl } from "./graphql";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "https://studio.apollographql.com"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/editor", editorRouter);
app.use("/api/room", roomRouter);

// GraphQL Setup
setupGraphQl(app);

// Error Handler
app.use(errorHandler);

export default app;
