import { Router } from "express";
import { adminController } from "../container";
import { updateStatusBlockUnblock } from "../validation/adminValidation";
import { authenticate } from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/isAdminMiddleware";
import { validate } from "../middlewares/validate";

const adminRouter = Router()

adminRouter.post("/login", adminController.loginUser)
adminRouter.get("/users", authenticate, isAdmin, adminController.getAllUsers)
adminRouter.post("/user/updateBlockStatus", authenticate, isAdmin, validate(updateStatusBlockUnblock), adminController.updateBlockStatus)

export default adminRouter 