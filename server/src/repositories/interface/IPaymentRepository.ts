import { Model } from "mongoose";
import { IPayment } from "../../models/PaymentModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
    getModel(): Model<IPayment>;
    getMonthlyRevenue(monthsBack: number): Promise<{ month: string; year: number; revenue: number }[]>;
    getRevenueByYear(year: number): Promise<{ month: string, revenue: number }[]>;
    getMontlyDataForGraphOverview(year: number): Promise<{ _id: number, total: number }[]>;
    getYearlyDataForGraphOverview(): Promise<{ _id: number, total: number }[]>;
    yearlySalesReport(): Promise<{ revenue: number, year: number }[]>;
    monthlySalesReport(year: number): Promise<{ revenue: number, month: string }[]>;
    dailySalesReport(year: number, month: number): Promise<{ revenue: number, year: number }[]>;
    salesReportByDate(date: string): Promise<{ revenue: number; date: string }>
}
