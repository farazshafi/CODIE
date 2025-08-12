import { Router } from "express";
import { isAdmin } from "../middlewares/isAdminMiddleware";
import { protect } from "../middlewares/protectMiddleware";
import { paymentController } from "../container";
import { authenticate } from "../middlewares/authenticate";


const paymentRouter = Router();

paymentRouter.get("/sales", authenticate, protect, isAdmin, paymentController.getSales);
paymentRouter.post("/failed_payment", authenticate, protect, paymentController.paymentFailure); 
paymentRouter.post("/user_paymenrt", authenticate, protect, paymentController.paymentFailure);
paymentRouter.get("/user_history", authenticate, protect, paymentController.getUserPaymentHistory);

export default paymentRouter;
