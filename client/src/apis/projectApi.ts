import API from "../lib/axiosInstance";

const API_BASE_URL = "/project";

export const createProjectApi = async (userData: { projectName: string, projectLanguage: string, projectCode: string }) => {
    try {
        const response = await API.post(`${API_BASE_URL}/create_project`, userData);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}
