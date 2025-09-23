import { NextFunction, Request, Response } from "express";
import { IPaymentService } from "../services/interface/IPaymentService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";

export class PaymentController {
    constructor(private readonly _paymentService: IPaymentService) { }

    getSales = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { payments, totalPages } = await this._paymentService.getAllPayments(page, limit);
            const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);

            const response = new ApiResponse(HttpStatusCode.OK, { payments, totalRevenue, totalPages }, "Fetched sales data successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    paymentFailure = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, planId, razorpayId, amount } = req.body;
            await this._paymentService.handleFailedPayment(userId, planId, razorpayId, amount);

            const response = new ApiResponse(HttpStatusCode.OK, null, "Payment Failed! Try again");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    getUserPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { paymentHistory, totalPages } = await this._paymentService.getUserPaymentHistory(userId, page, limit);

            const response = new ApiResponse(HttpStatusCode.OK, { paymentHistory, totalPages }, "Fetched user payment history");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }
}
