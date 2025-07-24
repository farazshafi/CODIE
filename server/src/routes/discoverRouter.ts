import { Router } from "express";
import { discoverController } from "../container";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";
import { aiAccess } from "../middlewares/subscriptionHandler";


export const discoverRouter = Router()

discoverRouter.post("/share", authenticate, protect, discoverController.shareToDiscover)
discoverRouter.get("/", authenticate, protect, discoverController.findDiscoveries)
discoverRouter.delete("/:id", authenticate, protect, discoverController.removeDiscover)
discoverRouter.post("/explain", authenticate, protect, aiAccess, discoverController.generateExplanation)

export default discoverRouter