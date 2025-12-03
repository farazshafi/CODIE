import { IPayment } from "../../models/PaymentModel";
import { GenerateParams, ViewMode } from "../PaymentService";


export interface IPaymentService {
    createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
    getPaymentById(id: string): Promise<IPayment | null>;
    getAllPayments(page: number, limit: number): Promise<{ payments: IPayment[], totalPages: number }>;
    updatePayment(id: string, paymentData: Partial<IPayment>): Promise<IPayment | null>;
    handleFailedPayment(userId: string, planId: string, razorpay_payment_id: string, amount: number): Promise<IPayment | null>;
    getUserPaymentHistory(userId: string, page: number, limit: number): Promise<{ paymentHistory: IPayment[], totalPages: number }>;
    adminDashboardPaymenttData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }>;
    getPaymentDataAdmin(page: number, limit: number, sort: string): Promise<{ payments: IPayment[], totalPages: number }>;
    updatePaymentStatus(id: string, status: "completed" | "failed"): Promise<IPayment>;
    getRevenueByYear(year: number): Promise<{ month: string, revenue: number }[]>;
    getMontlyDataForGraphOverview(year: number): Promise<{ _id: number, total: number }[]>;
    getYearlyDataForGraphOverview(): Promise<{ _id: number, total: number }[]>;
    getYearlySalesReport(): Promise<{ revenue: number, year: number }[]>;
    getMonthlySalesReport(year: number): Promise<{ revenue: number, month: string }[]>;
    getDailySalesReport(year: number, month: number): Promise<{ revenue: number, year: number }[]>;
    getSalesReportByDate(date: string): Promise<{ revenue: number; date: string }>
    generateSalesReportCsv(view: ViewMode, params: GenerateParams): Promise<{ csv: string; filename: string; }>
}
