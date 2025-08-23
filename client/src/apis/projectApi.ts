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

export const getProjectByRoomIdApi = async (roomId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/project_by_room_id/${roomId}`);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}

export const deleteProjectApi = async (projectId: string) => {
    try {
        const response = await API.delete(`${API_BASE_URL}/delete_project/${projectId}`);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}

export const saveCodeApi = async (data: { projectId:string ,code: string }) => {
    try {
        const response = await API.put(`${API_BASE_URL}/save_code`, data)
        return response.data
    } catch (err) {
        console.log("Error while saving code", err)
        throw err
    }
}

export const getCodeApi = async (id: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_code/${id}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getUsedLanguagesApi = async () => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_used_languages/`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getProjectsByUserIdApi = async () => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_projects/`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getContributedProjectsApi = async () => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_contributed_projects/`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}