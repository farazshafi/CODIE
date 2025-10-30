import { IDiscover } from "../models/DiscoverModel";
import { IGetDashboardOverview } from "../types/adminTypes";
import { IAdminService } from "./interface/IAdminService";
import { IDiscoverService } from "./interface/IDiscoverService";
import { IPaymentService } from "./interface/IPaymentService";
import { IProjectService } from "./interface/IProjectService";
import { IRoomService } from "./interface/IRoomService";
import { IUserService } from "./interface/IUserService";

export class AdminService implements IAdminService {
    constructor(
        private readonly _discoverService: IDiscoverService,
        private readonly _userService: IUserService,
        private readonly _roomService: IRoomService,
        private readonly _projectService: IProjectService,
        private readonly _paymentService: IPaymentService,
    ) { }

    async getTotalPublishedSnippets(): Promise<IDiscover[]> {
        return await this._discoverService.getTotalPublishedSnippets()
    }

    async getDashboardOverview(year: number): Promise<IGetDashboardOverview> {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const users = await this._userService.getMontlyUserForGraphOverview(year)
        const projects = await this._projectService.getMontlyDataForGraphOverview(year)
        const revenue = await this._paymentService.getMontlyDataForGraphOverview(year)
        const rooms = await this._roomService.getMontlyDataForGraphOverview(year)
        
        const monthlyData = monthNames.slice(0, currentMonth).map((name, index) => {
            const month = index + 1;
            return {
                name,
                users: users.find(u => u._id === month)?.count || 0,
                projects: projects.find(p => p._id === month)?.count || 0,
                rooms: rooms.find(r => r._id === month)?.count || 0,
                revenue: revenue.find(r => r._id === month)?.total || 0
            };
        });

        // ---------- YEARLY DATA ----------
        const yearlyUsers = await this._userService.getYearlyDataForGraphOverview()

        const yearlyProjects = await this._projectService.getYearlyDataForGraphOverview()

        const yearlyRevenue = await this._paymentService.getYearlyDataForGraphOverview()

        const yearlyRooms = await this._roomService.getYearlyDataForGraphOverview()

        const allYears = Array.from(new Set([
            ...yearlyUsers.map(u => u._id),
            ...yearlyProjects.map(p => p._id),
            ...yearlyRevenue.map(r => r._id),
            ...yearlyRooms.map(r => r._id)
        ])).sort();

        const yearlyData = allYears.map(y => ({
            name: y.toString(),
            users: yearlyUsers.find(u => u._id === y)?.count || 0,
            projects: yearlyProjects.find(p => p._id === y)?.count || 0,
            rooms: yearlyRooms.find(r => r._id === y)?.count || 0,
            revenue: yearlyRevenue.find(r => r._id === y)?.total || 0
        }));

        return { monthlyData, yearlyData };
    }
}