import API from "@/lib/axiosInstance"

const BASE_URL = "/userSubscription/"

export const getUserSubscriptionApi = async (userId: string) => {
    try {
        const response = await API.get(`${BASE_URL}get_subscription/${userId}`)
        return response.data
    } catch (error) {
        console.log("Error while getting user subscription", error)
        throw error
    }

}