import { Router } from "express";
import { adminController } from "../container";

const adminRouter = Router()

adminRouter.post("/login", adminController.loginUser)

export default adminRouter 