
import { string } from "zod";
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

export const dashboardDataApi = async () => {
    const response = await API.get(`/admin/dashboard_data`);
    return response.data;
}

export const getPaymentDataApi = async () => {
    try {
        const response = await API.get(`/admin/payment`)
        return response.data
    } catch (error) {
        console.log("Error While fetching Payment", error)
        throw error
    }
}

export const updatePaymentStatusApi = async (data: { id: string, status: "completed" | "failed" }) => {
    try {
        const response = await API.put(`/admin/update_payment_status`, data)
        return response.data
    } catch (error) {
        console.log("Error While fetching Payment", error)
        throw error
    }
}