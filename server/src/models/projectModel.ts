import mongoose, { Schema, Document } from 'mongoose';

interface IProject extends Document {
    projectName: string;
    projectLanguage: string;
    projectCode: string;
    userId: mongoose.Types.ObjectId;
}

const ProjectSchema: Schema = new Schema(
    {
        projectName: { type: String, required: true },
        projectLanguage: { type: String, required: true },
        projectCode: { type: String, required: true },
        userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);

export default ProjectModel;