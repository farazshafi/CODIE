import API from "../lib/axiosInstance";

const API_BASE_URL = `/starred`

export const starSnippetApi = async (projectId: string) => {
    try {
        const response = await API.post(`${API_BASE_URL}/snippet`, { projectId })
        return response.data
    } catch (error) {
        console.log("Error While starring snippet", error)
        throw error
    }
}

export const removeSnippetApi = async (projectId: string) => {
    try {
        const response = await API.delete(`${API_BASE_URL}/snippet/${projectId}`)
        return response.data
    } catch (error) {
        console.log("Error While starring snippet", error)
        throw error
    }
}

export const getStarredSnippetsApi = async () => {
    try {
        const response = await API.get(`${API_BASE_URL}/snippets`)
        return response.data
    } catch (error) {
        console.log("Error While starring snippet", error)
        throw error
    }
}
