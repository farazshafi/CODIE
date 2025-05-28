import { Router } from "express";
import { messageController } from "../container";

const messageRouter = Router()

messageRouter.get("/:roomId", messageController.getByRoomId);
messageRouter.post("/", messageController.createMessage);

export default messageRouter