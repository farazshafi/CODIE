import { IPayment } from "../../models/PaymentModel";

export interface IPaymentService {
    createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
    getPaymentById(id: string): Promise<IPayment | null>;
    getAllPayments(): Promise<IPayment[]>;
    updatePayment(id: string, paymentData: Partial<IPayment>): Promise<IPayment | null>;
    handleFailedPayment(userId: string, planId: string, razorpay_payment_id: string, amount: number): Promise<IPayment | null>;
    getUserPaymentHistory(userId: string, page: number, limit: number): Promise<{ paymentHistory: IPayment[], totalPages: number }>;
    adminDashboardPaymenttData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }>;
    getPaymentDataAdmin(): Promise<IPayment[]>;
    updatePaymentStatus(id: string, status: "completed" | "failed"): Promise<IPayment>;
}
