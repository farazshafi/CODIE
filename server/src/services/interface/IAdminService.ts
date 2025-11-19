import { IDiscover } from "../../models/DiscoverModel";
import { IGetDashboardOverview } from "../../types/adminTypes";
import { GenerateParams, ViewMode } from "../PaymentService";

export interface IAdminService {
    getTotalPublishedSnippets(): Promise<IDiscover[]>;
    getDashboardOverview(year: number): Promise<IGetDashboardOverview>;
    getYearlySalesReport(): Promise<{ revenue: number, year: number }[]>;
    getMonthlySalesReport(year: number): Promise<{ revenue: number, year: number }[]>;
    getDailySalesReport(year: number, month: number): Promise<{ revenue: number, year: number }[]>;
    getSalesReportByDate(date: string): Promise<{ revenue: number; date: string }>
    generateSalesReportCsv(view: ViewMode, params: GenerateParams): Promise<{ csv: any; filename: string; }>
}