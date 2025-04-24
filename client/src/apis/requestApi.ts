import API from "../lib/axiosInstance";

const API_BASE_URL = "/request";

export const getAllSendedRequestApi = async (userId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_sended_requests/${userId}`);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}

export const getAllRecivedRequestApi = async (userId: string) => {
    try {
        const response = await API.get(`${API_BASE_URL}/get_recived_requests/${userId}`);
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}
