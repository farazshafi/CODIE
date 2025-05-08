
import API from "../lib/axiosInstance";
const API_BASE_URL = "/invitation";


export const createInvitationApi = async (data: { roomId: string, senderId: string, reciverId: string }) => {
    try {
        const response = await API.post(`${API_BASE_URL}/create-invitation`, data)
        return response.data
    } catch (error) {
        console.log("Error While fetching code", error)
        throw error
    }
}