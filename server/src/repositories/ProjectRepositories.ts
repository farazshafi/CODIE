import mongoose, { Model } from 'mongoose';
import { IProject } from '../models/ProjectModel';
import Room from '../models/RoomModel';
import { BaseRepository } from './BaseRepository';
import { IProjectRepository } from './interface/IProjectRepository';

export class ProjectRepository extends BaseRepository<IProject> implements IProjectRepository {
    constructor(model: Model<IProject>) {
        super(model);
    }

    async isProjectNameExists(data: {
        userId: string;
        projectName: string;
        language: string;
    }): Promise<boolean> {
        const project = await this.model.findOne({
            userId: new mongoose.Types.ObjectId(data.userId),
            projectName: { $regex: `^${data.projectName}$`, $options: "i" },
            projectLanguage: data.language
        });
        return !!project;
    }

    async findProjectByUserId(userId: string): Promise<IProject[]> {
        return this.model.find({ userId: new mongoose.Types.ObjectId(userId) });
    }

    async findProjectByRoomId(roomId: string): Promise<string | null> {
        const room = await Room.findOne({ roomId });
        return room?.projectId?.toString() || null;
    }

    async updateCode(projectId: string, code: string): Promise<IProject | null> {
        return await this.model.findByIdAndUpdate(projectId, { projectCode: code }, { new: true });
    }

    async getProjectByIds(ids: string[]): Promise<IProject[]> {
        return await this.model.find({ _id: { "$in": ids } });
    }

    async getProjectsByYear(year: number): Promise<{ month: string, projects: number }[]> {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;

        const projectData = await this.model.aggregate([
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
                    projects: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    projects: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const result = monthNames.slice(0, currentMonth).map((name, index) => {
            const monthData = projectData.find(d => d.month === index + 1);
            return { month: name, projects: monthData ? monthData.projects : 0 };
        });

        return result;
    }

    async getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]> {
        return await this.model.aggregate([
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

    }

    async getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]> {
        return await this.model.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);
    }
}