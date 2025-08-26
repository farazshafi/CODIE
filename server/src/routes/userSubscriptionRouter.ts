import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";
import { userSubscriptionController } from "../container";
import { validate } from "../middlewares/validate";
import { verifySubscription } from "../validation/subscriptionValidation";


export const userSubscriptionRouter = Router()

userSubscriptionRouter.get("/get_subscription/:userId", authenticate, protect, userSubscriptionController.getUserSubscription)
userSubscriptionRouter.post("/subscribe", authenticate, protect, userSubscriptionController.subscribeToPlan)
userSubscriptionRouter.post("/verify_payment", authenticate, protect, validate(verifySubscription), userSubscriptionController.verifyPaymentAndUpdateUserSubscription)
userSubscriptionRouter.post("/downgrade_to_free", authenticate, protect, userSubscriptionController.downgradeToFree)

userSubscriptionRouter.get("/get_aiusage", authenticate, protect, userSubscriptionController.getUserAiUsage)

export default userSubscriptionRouter
