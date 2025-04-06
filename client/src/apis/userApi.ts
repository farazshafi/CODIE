
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const registerUserApi = async (userData: { email: string, name: string, password: string }) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData)
    return response.data
}

export const loginUserApi = async (userData: { email: string, password: string }) => {
    const response = await axios.post(`${API_BASE_URL}/login`, userData)
    return response.data
}

export const verifyOtpApi = async (userData: { email: string, otp: string }) => {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, userData)
    return response.data
}

export const resendOtpApi = async (userData: { email: string }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/resend-otp`, userData)
        return response.data
    } catch (err) {
        console.log(err)
    }
}

