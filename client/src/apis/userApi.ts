
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const registerUserApi = async (userData: { email: string, name: string, password: string }) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData)
    return response.data
}