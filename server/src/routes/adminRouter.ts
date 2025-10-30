import { Router } from "express";
import { adminController } from "../container";
import { updateStatusBlockUnblock } from "../validation/adminValidation";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { isAdmin } from "../middlewares/isAdminMiddleware";

const adminRouter = Router()

adminRouter.post("/login", adminController.loginUser)
adminRouter.get("/logout", authenticate, isAdmin, adminController.logoutUser)
adminRouter.get("/users", authenticate, isAdmin, adminController.getAllUsers)
adminRouter.get("/dashboard_data", authenticate, isAdmin, adminController.getDashboardData)
adminRouter.post("/user/updateBlockStatus", authenticate, isAdmin, validate(updateStatusBlockUnblock), adminController.updateBlockStatus)
adminRouter.get("/payment", authenticate, isAdmin, adminController.getPaymentData)
adminRouter.put("/update_payment_status", authenticate, isAdmin, adminController.updatePaymentStatus)
adminRouter.get("/graph", authenticate, isAdmin, adminController.getAdminGraph)
adminRouter.get("/revenue_by_year", authenticate, isAdmin, adminController.getRevenueByYear)
adminRouter.get("/users_by_year", authenticate, isAdmin, adminController.getUsersGraphByYear)
adminRouter.get("/projects_by_year", authenticate, isAdmin, adminController.getProjectsGraphByYear)
adminRouter.get("/snippets_by_year", authenticate, isAdmin, adminController.getDiscoveriesGraphByYear)
adminRouter.get("/rooms_by_year", authenticate, isAdmin, adminController.getRoomGraphByYear)
adminRouter.get("/subscription_history", authenticate, isAdmin, adminController.getSubscriptionHistory)
adminRouter.get("/dashboard_overview", authenticate, isAdmin, adminController.getDashboardOverview)
adminRouter.get("/total_published_snippets", authenticate, isAdmin, adminController.getAllPublishedSnippets)

export default adminRouter 