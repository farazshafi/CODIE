import { NextFunction, Request, Response } from "express"
import { UserService } from "../services/userServices"
import { GoogleAuthInput, googleAuthSchema, LoginInput, loginSchema, UserInput, userSchema } from "../validation/userValidation"
import { generateAccessToken, generateRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { OtpService } from "../services/otpServices"
import redis from "../config/redis"
import { UserRepository } from "../repositories/userRepositories"
import User from "../models/userModel"
import { HttpError } from "../utils/HttpError"


/**
 * @route   POST /api/register
 * @desc    send otp to email and save user data in redis
 * @access  Public
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedUser: UserInput = userSchema.parse(req.body)

        const userExist = await UserService.findUserByEmail(validatedUser.email)
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

/**
 * @route   POST /api/verify-otp
 * @desc    verify otp and create user in db
 * @access  Public
 */
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

        const newUser = await UserService.createUser(userData)

        await redis.del(redisKey)

        const payload = { email: newUser.email }
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
            data: newUser,
            accessToken
        })

    } catch (error) {
        next(error)
    }
}


/**
 * @route   POST /api/resend-otp
 * @desc    Resend OTP to the user's email
 * @access  Public
 */
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


/**
 * @route   POST /api/login
 * @desc    login a user
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credential: LoginInput = loginSchema.parse(req.body)

        const userExist = await UserService.findUserByEmail(credential.email)

        if (!userExist) {
            res.status(401).json({ message: "User not exists" })
            return
        }

        if (userExist && userExist?.googleId && userExist?.googleId.length > 1) {
            res.status(409).json({ message: "This account is accociated with Google , Please try to Login with google instead." });
        }

        const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

        console.log("comming data", req.body)
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid password or email" })
            return
        }

        const payload = { email: userExist.email }

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
                avatar: userExist.avatarUrl
            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

/**
 * @desc Fetches all users from the database. This function is used as a GraphQL resolver.
 * @access Admin
 * @throws {Error} If there is a database error
 */
export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await UserService.fetchUsers()
        res.status(200).json({ data: users })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }
}

/**
 * @desc Google register Auth
 * @access Public
 */
export const googleRegisterAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedUser: GoogleAuthInput = googleAuthSchema.parse(req.body)
        let user = await UserRepository.findByEmail(validatedUser.email)

        if (user && !user.googleId) {
            throw new HttpError(409, "An account with this email already exists")
        }
        if (!user) {
            const newUser = await User.create({
                name: validatedUser.name,
                email: validatedUser.email,
                googleId: validatedUser.googleId,
                avatarUrl: validatedUser.avatarUrl ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g",
                isAdmin: validatedUser.isAdmin ?? false,
                isBlocked: validatedUser.isBlocked ?? false
            });

            user = newUser;
        }


        const payload = { email: user.email }

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
                avatar: user.avatarUrl
            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

/**
 * @desc Google login Auth
 * @access Public
 */
export const googleLoginAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({ message: "Email is required" })
            return
        }

        const user = await UserRepository.findByEmail(email)

        if (!user) {
            res.status(401).json({ message: "User not exists" })
            return
        }

        if (user && !user.googleId) {
            res.status(409).json({ message: "An account with this email already exists" })
            return
        }

        const payload = { email: user.email }

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
                avatar: user.avatarUrl
            },
            accessToken
        })

    } catch (err) {
        next(err)
    }
}

