import mongoose from "mongoose";
import { IPayment } from "../models/PaymentModel";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { HttpError } from "../utils/HttpError";

export class PaymentService implements IPaymentService {
    constructor(private paymentRepository: PaymentRepository) { }

    async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
        return await this.paymentRepository.create(paymentData as IPayment);
    }

    async getPaymentById(id: string): Promise<IPayment | null> {
        return await this.paymentRepository.findById(id);
    }

    async getAllPayments(): Promise<IPayment[]> {
        return await this.paymentRepository.findAll();
    }

    async updatePayment(id: string, paymentData: Partial<IPayment>): Promise<IPayment | null> {
        return await this.paymentRepository.update(id, paymentData);
    }

    async handleFailedPayment(userId: string, planId: string, razorpay_payment_id: string, amount: number): Promise<IPayment | null> {
        try {
            const payment = await this.paymentRepository.create({
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
            const paymentHistory = await this.paymentRepository.getModel().find({ userId }).populate("subscriptionId", ["name"]).skip(skip).limit(limit);
            const totalCount = await this.paymentRepository.getModel().countDocuments({ userId });
            const totalPages = Math.ceil(totalCount / limit);
            return { paymentHistory, totalPages };
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server Error , While getting user payments")
        }
    }
}
