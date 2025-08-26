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

export const subscribeToPlanApi = async (data: { currency: string, amount: number }) => {
    try {
        const response = await API.post(`${BASE_URL}subscribe`, data)
        return response.data
    } catch (error) {
        console.log("Error while getting user subscription", error)
        throw error
    }

}

export const verifySubscriptionApi = async (data: {
    razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string,
    userId: string, planId: string
}) => {
    try {
        const response = await API.post(`${BASE_URL}verify_payment`, data)
        return response.data
    } catch (error) {
        console.log("Error while getting user subscription", error)
        throw error
    }

}

export const downgradeToFreePlanApi = async (data: { userId: string }) => {
    try {
        const response = await API.post(`${BASE_URL}downgrade_to_free`, data)
        return response.data
    } catch (error) {
        console.log("Error while getting user subscription", error)
        throw error
    }

}

export const saveFailedPaymentApi = async (data: { userId: string, planId: string, razorpayId: string, amount: number }) => {
    try {
        const response = await API.post(`/payment/failed_payment`, data)
        return response.data
    } catch (error) {
        console.log("Error while saving failed payment subscription", error)
        throw error
    }

}

export const getUserAiUsageApi = async () => {
    try {
        const response = await API.get(`${BASE_URL}/get_aiusage`)
        return response.data
    } catch (error) {
        console.log("Error while saving failed payment subscription", error)
        throw error
    }

}