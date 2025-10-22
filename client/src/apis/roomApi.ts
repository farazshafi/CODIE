import API from "@/lib/axiosInstance"
const API_BASE_URL = "/room"

export const enableCollabrationApi = async (projectId: string) => {
    try {
        const response = await API.post(`${API_BASE_URL}/create_room`, { projectId })
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getRoomByProjectIdApi = async (projectId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_room/${projectId}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getContributersApi = async (projectId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_contributers/${projectId}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const updateCollabratorRoleApi = async (data: { roomId: string, userId: string, role: "viewer" | "editor" }) => {
    try {
        const response = await API.post(`${API_BASE_URL}/update_role`, data)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const checkIsEligibleToEditApi = async (data: { roomId: string, userId: string }) => {
    try {
        const response = await API.post(`${API_BASE_URL}/ceck_permission_to_edit`, data)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const removeFromProjectApi = async (data: { projectId: string, userId: string }) => {
    try {
        const response = await API.put(`${API_BASE_URL}/remove_from_project`, data)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getAllContributersForUserApi = async () => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_all_contributers`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getContributedProjectsGraphData = async (userId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/contributed_Projects_graph/${userId}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}

export const getRecentContributionProjectsApi = async (userId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/recent_contributed_projects/${userId}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}