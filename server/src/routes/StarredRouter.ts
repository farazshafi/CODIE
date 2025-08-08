import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";
import { starredController } from "../container";


export const starredRouter = Router()

starredRouter.get("/snippets", authenticate, protect, starredController.getStarredSnippets)
starredRouter.get("/snippet/:id", authenticate, protect, starredController.getSnippetById)
starredRouter.post("/snippet", authenticate, protect, starredController.starASnippet)
starredRouter.delete("/snippet/:id", authenticate, protect, starredController.removeSnippet)

export default starredRouter
