import { toast } from "sonner";
import API from "../lib/axiosInstance";

export const registerUserApi = async (userData: { email: string, name: string, password: string }) => {
    const response = await API.post("/register", userData);
    return response.data;
}

export const loginUserApi = async (userData: { email: string, password: string }) => {
    const response = await API.post("/login", userData);
    if (response.data?.isBlocked) {
        toast.error("Uer is Blocked")
        return
    }
    return response.data;
}

export const logoutUserApi = async () => {
    const response = await API.get("/logout");
    if (response.data?.isBlocked) {
        toast.error("Uer is Blocked")
        return
    }
    return response.data;
}

export const verifyOtpApi = async (userData: { email: string, otp: string }) => {
    try {
        const response = await API.post("/verify-otp", userData);
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const getResetLinkApi = async (userData: { email: string }) => {
    try {
        const response = await API.post("/reset-link", userData);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const setNewPasswordApi = async (userData: { email: string, token: string, password: string }) => {
    try {
        const response = await API.post("/set-new-password", userData);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const resendOtpApi = async (userData: { email: string }) => {
    try {
        const response = await API.post("/resend-otp", userData);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const googleAuthRegisterApi = async (userData: { email: string, name: string, googleId: string, avatarUrl: string }) => {
    try {
        const response = await API.post("/google-auth-register", userData);
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const googleAuthLoginApi = async (userData: { email: string }) => {
    try {
        const response = await API.post("/google-auth-login", userData);
        if (response.data?.isBlocked) {
            toast.error("Uer is Blocked")
            return
        }
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const searchUsersApi = async (data: { email: string, userId: string }) => {
    try {
        const response = await API.post("/search-users", data);
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const updateUserApi = async (data: { name: string, github: string, portfolio: string, avatar: string }) => {
    try {
        const response = await API.put("/update_user", data);
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const getUserApi = async () => {
    try {
        const response = await API.get("/get_user");
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const getContributerData = async (email: string) => {
    try {
        const response = await API.get(`/get_contributer/${email}`);
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const updateProfileVisibilityApi = async (isVisible: boolean) => {
    try {
        const response = await API.put(`/update_profile_visibility`, { isVisible });
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}

export const getProfileVisibilityApi = async (userId: string) => {
    try {
        const response = await API.get(`/get_profile_visibility/${userId}`);
        return response.data;
    } catch (err) {
        console.log("api error", err);
        throw err;
    }
}