import { editorRepositories } from "../repositories/editorRepositories";
import { projectRepositories } from "../repositories/projectRepositories"
import { HttpError } from "../utils/HttpError";

class EditorServices {

    async saveCode(id: string, code: string) {
        try {
            const project = await projectRepositories.findProjectById(id)
            if (project) {
                return await editorRepositories.updateCode(project, code)
            } else {
                throw new HttpError(404, "Project not found");
            }
        } catch (err) {
            console.log("Error saving code", err)
            if (err instanceof HttpError) {
                throw err;
            }

            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }

    async getSavedCode(id: string) {
        try {
            const project = await editorRepositories.getCodeByProjectId(id)
            if (project) {
                return project
            } else {
                throw new HttpError(404, "Project not found")
            }
        } catch (err) {
            console.log("Error saving code", err)
            if (err instanceof HttpError) {
                throw err;
            }

            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }

}

export const editorServices = new EditorServices()