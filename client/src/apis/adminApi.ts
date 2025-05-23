
import API from "../lib/axiosInstance";

export const loginAdminApi = async (userData: { email: string, password: string }) => {
    const response = await API.post("/admin/login", userData);
    return response.data;
}

export const allUsersApi = async ({ page = "1", limit = "1", search = "", status = "all" }: { page: string, limit: string, search: string, status: string }) => {
    const response = await API.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&status=${status}`);
    return response.data;
}

export const blockUnblockUserApi = async (data: { status: "suspend" | "active", userId: string }) => {
    const response = await API.post(`/admin/user/updateBlockStatus`, data);
    return response.data;
}