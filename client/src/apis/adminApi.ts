
import API from "../lib/axiosInstance";

export const loginAdminApi = async (userData: { email: string, password: string }) => {
    const response = await API.post("/admin/login", userData);
    return response.data;
}