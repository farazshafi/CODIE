
import API from "../lib/axiosInstance";
const API_BASE_URL = "/message";


export const getChatMessagesApi = async (roomId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/${roomId}`)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}
