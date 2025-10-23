import API from "../lib/axiosInstance";

export const loginAdminApi = async (userData: { email: string, password: string }) => {
    const response = await API.post("/admin/login", userData);
    return response.data;
}

export const logoutAdminApi = async () => {
    const response = await API.get("/admin/logout");
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

export const getPaymentDataApi = async (page = 1,) => {
    try {
        const response = await API.get(`/admin/payment?page=${page}&limit=10`)
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

export const getAdminGraphApi = async () => {
    try {
        const response = await API.get(`/admin/graph`)
        return response.data
    } catch (error) {
        console.log("Error While fetching  graph", error)
        throw error
    }
}

type SubscriptionHistoryParams = {
    year?: number;
    month?: number;
    sort?: string;
    search?: string;
    limit?: number;
    currentPage?: number;
};

export const getAllSubscriptionHistoryApi = async ({
    year,
    month,
    sort,
    search,
    limit = 5,
    currentPage = 1

}: SubscriptionHistoryParams) => {
    try {
        const response = await API.get(`/admin/subscription_history`, {
            params: { year, month, sort, search, limit, currentPage },
        });
        return response.data;
    } catch (error) {
        console.log("Error While fetching subscription", error);
        throw error;
    }
};
