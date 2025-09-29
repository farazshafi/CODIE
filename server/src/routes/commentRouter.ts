import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";
import { commentController } from "../container";


export const commentRouter = Router()

commentRouter.post("/", authenticate, protect, commentController.createComment)
commentRouter.get("/:projectId", authenticate, protect, commentController.getAllComments)
commentRouter.post("/:commentId/like", authenticate, protect, commentController.toggleLike);


export default commentRouter

