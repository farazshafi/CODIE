import API from "../lib/axiosInstance";

const API_BASE_URL = `/payment`

export const getUserPaymentHistoryApi = async (page = "1", limit = "5") => {
    try {
        const response = await API.get(`${API_BASE_URL}/user_history?page=${page}&limit=${limit}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}