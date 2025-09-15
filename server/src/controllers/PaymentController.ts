import { NextFunction, Request, Response } from "express";
import { IPaymentService } from "../services/interface/IPaymentService";
import { HttpStatusCode } from "../utils/httpStatusCodes";

export class PaymentController {
    constructor(private readonly paymentService: IPaymentService) { }

    getSales = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payments = await this.paymentService.getAllPayments();
            const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);
            res.status(HttpStatusCode.OK).json({ payments, totalRevenue });
        } catch (error) {
            next(error);
        }
    }

    paymentFailure = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, planId, razorpayId, amount } = req.body
            await this.paymentService.handleFailedPayment(userId, planId, razorpayId, amount)
            res.status(HttpStatusCode.OK).json({ message: "Payment Failed!, Try again" });
        } catch (error) {
            next(error);
        }
    }

    getUserPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { paymentHistory, totalPages } = await this.paymentService.getUserPaymentHistory(userId, page, limit)
            res.status(HttpStatusCode.OK).json({ paymentHistory, totalPages });
        } catch (error) {
            next(error);
        }
    }
}
