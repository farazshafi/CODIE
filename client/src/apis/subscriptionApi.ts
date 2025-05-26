
import API from "../lib/axiosInstance";

const API_BASE_URL = "/subscription";

export const getAllSubscriptionApi = async ({ page = "1", limit = "1", search = "", status = "all" }: { page: string, limit: string, search: string, status: string }) => {
    try {
        const response = await API.get(`${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}`);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}

export const blockUnblockSubscribeApi = async (data: { id: string, status: string }) => {
    try {
        const response = await API.put(`${API_BASE_URL}/block_unblock`, data);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}