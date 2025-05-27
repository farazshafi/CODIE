import { Router } from "express";
import { isAdmin } from "../middlewares/isAdminMiddleware";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createSubscription, updateSubscription } from "../validation/subscriptionValidation";
import { subscriptionController } from "../container";


const subscriptionRouter = Router()

subscriptionRouter.post("/create_subscription", authenticate, isAdmin, validate(createSubscription), subscriptionController.createSubscription)
subscriptionRouter.delete("/delete_subscription/:id", authenticate, isAdmin, subscriptionController.deleteSubscription)
subscriptionRouter.get("/", subscriptionController.getAllSubscriptions)
subscriptionRouter.patch("/edit_subscription/:id", authenticate, isAdmin, validate(updateSubscription), subscriptionController.updateSubscription);
subscriptionRouter.put("/block_unblock/", authenticate, isAdmin, subscriptionController.blockUnblock);


export default subscriptionRouter