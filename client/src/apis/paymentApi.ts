import API from "../lib/axiosInstance";

const API_BASE_URL = `/payment`

export const getUserPaymentHistoryApi = async (data: { page: string | "1", limit: string | "5" }) => {
    try {
        const response = await API.get(`${API_BASE_URL}/user_history?page=${data.page}&limit=${data.limit}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}