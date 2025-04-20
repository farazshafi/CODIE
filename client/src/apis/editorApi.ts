import API from "../lib/axiosInstance";

const API_BASE_URL = "/editor"

export const saveCodeApi = async (data: { code: string }) => {
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