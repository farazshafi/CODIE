import { FilterQuery, Model } from "mongoose";
import { IDiscover } from "../models/DiscoverModel";
import { BaseRepository } from "./BaseRepository";
import { IDiscoverRepository } from "./interface/IDiscoverRepository";


export class DiscoverRepository extends BaseRepository<IDiscover> implements IDiscoverRepository {
    constructor(model: Model<IDiscover>) {
        super(model)
    }
    getModel(): Model<IDiscover> {
        return this.model
    }

    getTotalPublishedProjects(): Promise<IDiscover[]> {
        return this.model.find({})
    }

    async countDoc(condition: FilterQuery<IDiscover>): Promise<number> {
        return this.model.countDocuments(condition).exec();
    }

    async getDiscoverStatsByYear(year: number): Promise<{ month: string, snippet: number }[]> {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;

        const discoverData = await this.model.aggregate([
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
                    snippet: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    snippet: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const result = monthNames.slice(0, currentMonth).map((name, index) => {
            const monthData = discoverData.find(d => d.month === index + 1);
            return { month: name, snippet: monthData ? monthData.snippet : 0 };
        });

        return result;
    }



}