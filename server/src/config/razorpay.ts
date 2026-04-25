
import Razorpay from "razorpay";
import { ENV } from "./env";

if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_SECRET_ID) {
    console.error("Razorpay instance initialization failed: Missing KEY_ID or SECRET_ID");
}

export const razorpayInstance = new Razorpay({
    key_id: ENV.RAZORPAY_KEY_ID,
    key_secret: ENV.RAZORPAY_SECRET_ID,
});


