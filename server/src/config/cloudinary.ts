import dotenv from "dotenv"
dotenv.config()

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET) {
    console.warn("WARNING: Cloudinary credentials are missing from environment variables!")
}

export default cloudinary
