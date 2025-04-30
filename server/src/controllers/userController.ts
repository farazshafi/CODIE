import { NextFunction, Request, Response } from "express"
import { GoogleAuthInput, LoginInput, UserInput } from "../validation/userValidation"
import { userService } from "../container"
import { OtpService } from "../services/otpServices"
import redis from "../config/redis"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUser } from "../models/userModel"


export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedUser: UserInput = req.body
        const userExist = await userService.findUserByEmail(validatedUser.email)

        if (userExist) {
            res.status(400).json({ message: "User already exists" })
            return
        }

        await OtpService.generateAndSendOtp(validatedUser.email)

        const redisKey = `pendingUser:${validatedUser.email}`
        await redis.set(redisKey, JSON.stringify(validatedUser), 'EX', 300)

        res.status(200).json({
            message: "OTP sent to email. Please verify to complete registration."
        })

    } catch (error) {
        next(error)
    }
}

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body

        await OtpService.verifyOtp(email, otp)

        const redisKey = `pendingUser:${email}`
        const userDataStr = await redis.get(redisKey)

        if (!userDataStr) {
            res.status(400).json({ message: "No pending registration found or expired." })
            return
        }

        const userData: UserInput = JSON.parse(userDataStr)

        const newUser = await userService.createUser(userData)

        await redis.del(redisKey)

        const payload = { id: newUser._id, email: newUser.email }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(201).json({
            message: "User registered successfully",
            data: {
                name: newUser.name,
                email: newUser.email,
                id: newUser._id
            },
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        const redisKey = `pendingUser:${email}`
        const userDataStr = await redis.get(redisKey)

        if (!userDataStr) {
            res.status(400).json({ message: "No pending registration found or expired." })
            return
        }

        await OtpService.generateAndSendOtp(email)

        res.status(200).json({
            message: "OTP resent to email. Please verify to complete registration."
        })
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credential: LoginInput = req.body

        const userExist = await userService.findUserByEmail(credential.email)

        if (!userExist) {
            res.status(401).json({ message: "User not exists" })
            return
        }

        if (userExist && userExist?.googleId && userExist?.googleId.length > 1) {
            res.status(409).json({ message: "This account is accociated with Google , Please try to Login with google instead." });
        }

        const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid password or email" })
            return
        }

        const payload = { id: userExist._id, email: userExist.email }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({
            message: "Login Success",
            data: {
                name: userExist.name,
                email: userExist.email,
                avatar: userExist.avatarUrl,
                id: userExist._id
            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

export const googleRegisterAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedUser: GoogleAuthInput = req.body
        const user = await userService.findUserByEmail(validatedUser.email)

        if (user && !user.googleId) {
            res.status(409).json({ message: "An account with this email already exists" })
            return
        }

        let myUser: IUser;

        if (!user) {
            const newUser = await userService.createUser({
                name: validatedUser.name,
                email: validatedUser.email,
                googleId: validatedUser.googleId,
                avatarUrl: validatedUser.avatarUrl ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g",
                isAdmin: validatedUser.isAdmin ?? false,
                isBlocked: validatedUser.isBlocked ?? false
            });

            myUser = newUser;
        }


        const payload = { id: myUser._id, email: myUser.email }
        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            message: "Google Auth Success",
            data: {
                name: myUser.name,
                email: myUser.email,
                avatar: myUser.avatarUrl,
                id: myUser._id

            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

export const googleLoginAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({ message: "Email is required" })
            return
        }

        const user = await userService.findUserByEmail(email)

        if (!user) {
            res.status(401).json({ message: "User not exists" })
            return
        }

        if (user && !user.googleId) {
            res.status(409).json({ message: "An account with this email already exists" })
            return
        }

        const payload = { id: user._id, email: user.email }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            message: "Google Auth Success",
            data: {
                name: user.name,
                email: user.email,
                avatar: user.avatarUrl,
                id: user._id

            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

export const refreshAccessToken = (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken

        if (!token) {
            res.status(401).json({ message: "Refresh token missing" });
            return
        }

        const decoded = verifyRefreshToken(token);
        const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

        res.status(200).json({ accessToken });
        return
    } catch (err) {
        console.log("error from here....", err)
        res.status(403).json({ message: "Invalid refresh token" });
    }
};
