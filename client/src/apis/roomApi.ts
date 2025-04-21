import API from "../lib/axiosInstance";

const API_BASE_URL = `/room`

export const enableCollabrationApi = async (projectId: string) => {
    try {
        const response = await API.post(`${API_BASE_URL}/create_room`, {projectId})
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}