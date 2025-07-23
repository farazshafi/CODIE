import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectBase {
    projectName: string;
    projectLanguage: string;
    projectCode: string;
    userId: mongoose.Types.ObjectId;
}

export interface IProject extends IProjectBase, Document {}

const ProjectSchema: Schema = new Schema(
    {
        projectName: { type: String, required: true },
        projectLanguage: { type: String, required: true },
        projectCode: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

export const ProjectModel = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default ProjectModel;