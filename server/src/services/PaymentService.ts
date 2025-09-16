import mongoose from "mongoose";
import { IPayment } from "../models/PaymentModel";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { HttpError } from "../utils/HttpError";

export class PaymentService implements IPaymentService {
    constructor(private _paymentRepository: PaymentRepository) { }

    async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
        return await this._paymentRepository.create(paymentData as IPayment);
    }

    async getPaymentById(id: string): Promise<IPayment | null> {
        return await this._paymentRepository.findById(id);
    }

    async getAllPayments(): Promise<IPayment[]> {
        return await this._paymentRepository.findAll();
    }

    async updatePayment(id: string, paymentData: Partial<IPayment>): Promise<IPayment | null> {
        return await this._paymentRepository.update(id, paymentData);
    }

    async handleFailedPayment(userId: string, planId: string, razorpay_payment_id: string, amount: number): Promise<IPayment | null> {
        try {
            const payment = await this._paymentRepository.create({
                userId: new mongoose.Types.ObjectId(userId),
                subscriptionId: new mongoose.Types.ObjectId(planId),
                amount,
                currency: "INR",
                paymentStatus: "failed",
                transactionId: razorpay_payment_id,
            });
            if (!payment) throw new HttpError(500, "Cannot create Payment")
            return payment
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server Error , while creating payment")
        }
    }

    async getUserPaymentHistory(userId: string, page: number, limit: number): Promise<{ paymentHistory: IPayment[], totalPages: number }> {
        try {
            const skip = (page - 1) * limit;
            const paymentHistory = await this._paymentRepository.getModel().find({ userId }).populate("subscriptionId", ["name"]).skip(skip).limit(limit);
            const totalCount = await this._paymentRepository.getModel().countDocuments({ userId });
            const totalPages = Math.ceil(totalCount / limit);
            return { paymentHistory, totalPages };
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server Error , While getting user payments")
        }
    }

    async adminDashboardPaymenttData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }> {
        try {
            const totalCompletedAmountAgg = await this._paymentRepository.getModel().aggregate([
                { $match: { paymentStatus: "completed" } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]);
            const totalCompletedAmount = totalCompletedAmountAgg[0]?.totalAmount || 0;

            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const paymentThisMonth = await this._paymentRepository.count({ createdAt: { $gte: startOfThisMonth } });

            const paymentLastMonth = await this._paymentRepository.count({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });

            let change = '0%';
            let positive = true;
            if (paymentLastMonth > 0) {
                const percentChange = ((paymentThisMonth - paymentLastMonth) / paymentLastMonth) * 100;
                change = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
                positive = percentChange >= 0;
            } else if (paymentThisMonth > 0) {
                change = '+100%';
                positive = true;
            }

            const icon = 'Payment';

            return {
                title: 'Total Payment',
                value: totalCompletedAmount.toLocaleString(),
                icon,
                change,
                positive
            };
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Server error while getting dashboard user data");
        }
    }

    async getPaymentDataAdmin(): Promise<IPayment[]> {
        try {
            return await this._paymentRepository.getModel().find({}).populate("userId", ["name"]).select(["amount", "paymentStatus", "transactionId", "paymentDate"])
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Server error while getting payment data");
        }
    }

    async updatePaymentStatus(id: string, status: "completed" | "failed"): Promise<IPayment> {
        try {
            const payment = await this._paymentRepository.findOneAndUpdate({ _id: id }, { paymentStatus: status })
            if (!payment) {
                throw new HttpError(404, "Payment with id is not found!")
            }
            return payment
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error);
            throw new HttpError(500, "Server error while getting payment data");
        }
    }
}
