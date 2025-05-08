import API from "../lib/axiosInstance";

export const registerUserApi = async (userData: { email: string, name: string, password: string }) => {
    const response = await API.post("/register", userData);
    return response.data;
}

export const loginUserApi = async (userData: { email: string, password: string }) => {
    const response = await API.post("/login", userData);
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

export const googleAuthRegisterApi = async (userData: { email: string, name: string, googleId: string }) => {
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