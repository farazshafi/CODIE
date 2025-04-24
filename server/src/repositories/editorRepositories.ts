import ProjectModel from "../models/projectModel"

class EditorRepositories {
    async updateCode(project, code: string) {
        const updatedProject = await ProjectModel.findByIdAndUpdate(
            project._id,
            { projectCode: code },
            { new: true }
        );
        return updatedProject;
    }

    async getCodeByProjectId(id: string) {
        return await ProjectModel.findById(id)
    }
}

export const editorRepositories = new EditorRepositories()