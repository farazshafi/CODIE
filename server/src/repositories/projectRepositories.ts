import mongoose, { Model } from 'mongoose';
import { IProject } from '../models/projectModel';
import Room from '../models/roomModel';
import { BaseRepository } from './baseRepository';
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

    async updateCode(project: IProject, code: string): Promise<IProject> {
        return this.model.findByIdAndUpdate(project._id as string, { projectCode: code })
    }

    async getProjectByIds(ids: string[]): Promise<IProject[]> {
        return await this.model.find({ _id: { "$in": ids } });
    }

}