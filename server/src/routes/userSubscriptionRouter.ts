import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";
import { userSubscriptionController } from "../container";


export const userSubscriptionRouter = Router()

userSubscriptionRouter.get("/get_subscription/:userId", authenticate, protect, userSubscriptionController.getUserSubscription)

export default userSubscriptionRouter
