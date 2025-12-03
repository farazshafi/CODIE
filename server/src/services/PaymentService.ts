import mongoose from "mongoose";
import { IPayment } from "../models/PaymentModel";
import { IPaymentService } from "./interface/IPaymentService";
import { HttpError } from "../utils/HttpError";
import { IPaymentRepository } from "../repositories/interface/IPaymentRepository";
import { logger } from "../utils/logger";
import { Parser } from "json2csv";


export type ViewMode = "yearly" | "monthly" | "daily" | "date";
type CsvRow = Record<string, string | number>;


export interface GenerateParams {
    year?: number;
    month?: number
    date?: string;
}

export class PaymentService implements IPaymentService {
    constructor(private _paymentRepository: IPaymentRepository) { }

    async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
        return await this._paymentRepository.create(paymentData as IPayment);
    }

    async getPaymentById(id: string): Promise<IPayment | null> {
        return await this._paymentRepository.findById(id);
    }

    async getAllPayments(page: number, limit: number): Promise<{ payments: IPayment[], totalPages: number }> {
        const skip = (page - 1) * limit;
        const payments = await this._paymentRepository.getModel().find().skip(skip).limit(limit);
        const totalCount = await this._paymentRepository.getModel().countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        return { payments, totalPages };
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

    async getPaymentDataAdmin(page: number, limit: number, sort: string): Promise<{ payments: IPayment[]; totalPages: number }> {
        try {
            const skip = (page - 1) * limit;

            let filter: Record<string, string> = {};
            if (sort !== "all") {
                filter = { paymentStatus: sort.toLowerCase() }
            }

            console.log("sort and filter", sort, filter)

            const payments = await this._paymentRepository
                .getModel()
                .find(filter)
                .populate("userId", ["name"])
                .select(["amount", "paymentStatus", "transactionId", "paymentDate"])
                .skip(skip)
                .limit(limit)
                .sort({ paymentDate: -1 });

            const totalCount = await this._paymentRepository
                .getModel()
                .countDocuments(filter);

            const totalPages = Math.ceil(totalCount / limit);

            return { payments, totalPages };
        } catch (error) {
            console.error(error);
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

    async getRevenueByYear(year: number): Promise<{ month: string, revenue: number }[]> {
        try {
            return await this._paymentRepository.getRevenueByYear(year)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error);
            logger.error("Error while Fetching revenue")
            throw new HttpError(500, "Server error while Fetching revenue");
        }
    }

    async getMontlyDataForGraphOverview(year: number): Promise<{ _id: number, total: number }[]> {
        return this._paymentRepository.getMontlyDataForGraphOverview(year)
    }

    async getYearlyDataForGraphOverview(): Promise<{ _id: number, total: number }[]> {
        return this._paymentRepository.getYearlyDataForGraphOverview()
    }

    async getYearlySalesReport(): Promise<{ revenue: number; year: number; }[]> {
        try {
            return await this._paymentRepository.yearlySalesReport()
        } catch (error) {
            console.log(error)
            logger.error("Error while Fetching yearly sales report")
            throw new HttpError(500, "Error while Fetching yearly sales report")
        }
    }

    async getMonthlySalesReport(year: number): Promise<{ revenue: number; month: string; }[]> {
        try {
            return await this._paymentRepository.monthlySalesReport(year)
        } catch (error) {
            console.log(error)
            logger.error("Error while Fetching monthly sales report")
            throw new HttpError(500, "Error while Fetching monthly sales report")
        }
    }

    async getDailySalesReport(year: number, month: number): Promise<{ revenue: number; year: number; }[]> {
        try {
            return await this._paymentRepository.dailySalesReport(year, month)
        } catch (error) {
            console.log(error)
            logger.error("Error while Fetching daily sales report")
            throw new HttpError(500, "Error while Fetching daily sales report")
        }
    }

    async getSalesReportByDate(date: string): Promise<{ revenue: number; date: string; }> {
        try {
            return await this._paymentRepository.salesReportByDate(date)
        } catch (error) {
            console.log(error)
            logger.error("Error while Fetching sales report by date")
            throw new HttpError(500, "Error while Fetching sales report by date")
        }
    }

    async generateSalesReportCsv(view: ViewMode, params: GenerateParams = {}): Promise<{ csv: string; filename: string }> {

        let rows: CsvRow[] = [];
        let filename = `sales_report_${view}`;

        switch (view) {

            case "yearly": {
                const data = await this._paymentRepository.yearlySalesReport();
                rows = data.map((r: { year: number, revenue: number }) => ({
                    year: r.year,
                    revenue: r.revenue,
                }));
                filename += `_${new Date().getFullYear()}`;
                break;
            }

            case "monthly": {
                const year = params.year ?? new Date().getFullYear();
                const data = await this._paymentRepository.monthlySalesReport(year);
                rows = data.map((r: { month: string, revenue: number }) => ({
                    month: r.month,
                    revenue: r.revenue,
                }));
                filename += `_${year}`;
                if (typeof params.month === "number") {
                    filename += `_${params.month + 1}`;
                }
                break;
            }

            case "daily": {
                const year = params.year ?? new Date().getFullYear();
                if (params.month === undefined) {
                    throw new Error("monthly index (month) is required for daily view");
                }
                const repoMonth = params.month;

                const data = await this._paymentRepository.dailySalesReport(year, repoMonth);
                rows = data.map((r: {day:number, revenue:number}) => ({
                    day: r.day,
                    revenue: r.revenue,
                }));

                filename += `_${year}_${repoMonth + 1}`;
                break;
            }

            case "date": {
                if (!params.date) {
                    throw new Error("date is required for date view");
                }
                const r: {date:string, revenue: number} = await this._paymentRepository.salesReportByDate(params.date);
                rows = [{ date: r.date, revenue: r.revenue }];
                filename += `_${params.date}`;
                break;
            }

            default:
                throw new Error("Unsupported view mode");
        }

        // Determine CSV fields dynamically
        const fields = rows.length > 0 ? Object.keys(rows[0]) : ["label", "revenue"];
        const json2csvParser = new Parser({ fields });

        const csv: string = rows.length
            ? json2csvParser.parse(rows)
            : `${fields.join(",")}\n`;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        filename = `${filename}_${timestamp}.csv`;

        return { csv, filename };
    }
}
