import nodemailer from "nodemailer";
import { ENV } from "./env";


export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
    },
});
