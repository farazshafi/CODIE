import { IAdminRepository } from "./interface/IAdminRepository";
import { IPaymentRepository } from "./interface/IPaymentRepository";
import { IProjectRepository } from "./interface/IProjectRepository";
import { IRoomRepository } from "./interface/IRoomRepository";
import { IUserRepository } from "./interface/IUserRepository";


export class AdminRepository implements IAdminRepository {

    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _roomRepository: IRoomRepository,
        private readonly _projectRepository: IProjectRepository,
        private readonly _paymentRepository: IPaymentRepository,
    ){}

    async getDashboardOverview(year: number) {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const users = await this._userRepository.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const projects = await this._projectRepository.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const revenue = await this._paymentRepository.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$paymentDate" },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const rooms = await this._roomRepository.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

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
        const yearlyUsers = await this._userRepository.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const yearlyProjects = await this._projectRepository.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const yearlyRevenue = await this._paymentRepository.aggregate([
            {
                $match: { paymentStatus: "completed" }
            },
            {
                $group: {
                    _id: { $year: "$paymentDate" },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const yearlyRooms = await this._roomRepository.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

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