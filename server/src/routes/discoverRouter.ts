import { Router } from "express";
import { discoverController } from "../container";
import { authenticate } from "../middlewares/authenticate";
import { protect } from "../middlewares/protectMiddleware";


export const discoverRouter = Router()

discoverRouter.post("/share", authenticate, protect, discoverController.shareToDiscover)
discoverRouter.get("/", authenticate, protect, discoverController.findDiscoveries)
discoverRouter.delete("/:id", authenticate, protect, discoverController.removeDiscover)

export default discoverRouter