import { NextFunction, Request, Response } from "express"
import { GoogleAuthInput, LoginInput, UserInput } from "../validation/userValidation"
import redis from "../config/redis"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"
import { IOtpService } from "../services/interface/IOtpServices"
import crypto from "crypto"
import { IMailService } from "../services/interface/IMailService"
import jwt from "jsonwebtoken"
import { HttpStatusCode } from "../utils/httpStatusCodes"
import { ApiResponse } from "../utils/ApiResponse"

export class UserController {
    constructor(
        private readonly _userService: IUserService,
        private readonly _otpService: IOtpService,
        private readonly _mailService: IMailService,
    ) { }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedUser: UserInput = req.body
            const userExist = await this._userService.findUserByEmail(validatedUser.email)

            if (userExist) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "User already exist")
                res.status(response.statusCode).json(response)
                return
            }

            await this._otpService.generateAndSendOtp(validatedUser.email)

            const redisKey = `pendingUser:${validatedUser.email}`
            await redis.set(redisKey, JSON.stringify(validatedUser), 'EX', 300)

            const response = new ApiResponse(
                HttpStatusCode.OK,
                null,
                "OTP sent to email. Please verify to complete registration."
            )
            res.status(response.statusCode).json(response)

        } catch (error) {
            next(error)
        }
    }

    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body

            await this._otpService.verifyOtp(email, otp)

            const redisKey = `pendingUser:${email}`
            const userDataStr = await redis.get(redisKey)

            if (!userDataStr) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "No pending registration found or expired.")
                res.status(response.statusCode).json(response)
                return
            }

            const userData: UserInput = JSON.parse(userDataStr)

            const newUser = await this._userService.createUser(userData)

            await redis.del(redisKey)

            const payload = { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE), // 7 days
            })

            const response = new ApiResponse(
                HttpStatusCode.CREATED,
                {
                    name: newUser.name,
                    email: newUser.email,
                    id: newUser._id,
                    isAdmin: newUser.isAdmin,
                    isPublic: newUser.isPublic,
                    accessToken
                },
                "User registered successfully"
            )
            res.status(response.statusCode).json(response)

        } catch (error) {
            next(error)
        }
    }

    resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const redisKey = `pendingUser:${email}`
            const userDataStr = await redis.get(redisKey)

            if (!userDataStr) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "No pending registration found or expired.")
                res.status(response.statusCode).json(response)
            }

            await this._otpService.generateAndSendOtp(email)

            const response = new ApiResponse(
                HttpStatusCode.OK,
                null,
                "OTP resent to email. Please verify to complete registration."
            )
            res.status(response.statusCode).json(response)

        } catch (error) {
            next(error)
        }
    }

    resetLink = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const user = await this._userService.findUserByEmail(email)
            if (!user) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "User Not Found!")
                res.status(response.statusCode).json(response)
                return
            }
            if (user.googleId) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Password reset is not available for Google accounts.")
                res.status(response.statusCode).json(response)
                return
            }

            const resetToken = crypto.randomBytes(32).toString("hex")

            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
            await this._userService.savePasswordResetToken(email, hashedToken, new Date(Date.now() + 3600000)); // 1h

            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`

            await this._mailService.sendResetLink(email, resetLink)

            const response = new ApiResponse(HttpStatusCode.OK, null, "Password reset link sent to your email.")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this._userService.findUserByEmail(credential.email)

            if (!userExist) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "User not exists")
                res.status(response.statusCode).json(response)
                return
            }

            if (userExist.isBlocked) {
                const response = new ApiResponse(HttpStatusCode.FORBIDDEN, { isBlocked: true }, "User Blocked")
                res.status(response.statusCode).json(response)
                return
            }

            if (userExist.googleId && userExist.googleId.length > 1) {
                const response = new ApiResponse(HttpStatusCode.CONFLICT, null, "This account is associated with Google, please login with Google instead.")
                res.status(response.statusCode).json(response)
                return
            }

            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                const response = new ApiResponse(HttpStatusCode.UNAUTHORIZED, null, "Invalid password or email")
                res.status(response.statusCode).json(response)
                return
            }

            const payload = { id: userExist._id, email: userExist.email, isAdmin: userExist.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE), // 7 days
            })

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: userExist.name,
                    email: userExist.email,
                    avatar: userExist.avatarUrl,
                    id: userExist._id,
                    isAdmin: userExist.isAdmin,
                    github: userExist.github,
                    portfolio: userExist.portfolio,
                    isPublic: userExist.isPublic,
                    accessToken
                },
                "Login Success"
            )
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    logoutUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1]

            const decoded = jwt.decode(token)

            if (!decoded || !decoded.exp) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Invalid token")
                res.status(response.statusCode).json(response)
                return
            }

            const expiresAt = decoded.exp
            const ttl = expiresAt - Math.floor(Date.now() / 1000)
            if (ttl > 0) {
                await redis.setex(`blacklist:${token}`, ttl, "true")
            }

            const response = new ApiResponse(HttpStatusCode.OK, null, "Logged out successfully")
            res.status(response.statusCode).json(response)
            return
        } catch (err) {
            next(err)
        }
    }

    googleRegisterAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedUser: GoogleAuthInput = req.body
            let user = await this._userService.findUserByEmail(validatedUser.email)

            if (user && !user.googleId) {
                const response = new ApiResponse(HttpStatusCode.CONFLICT, null, "An account with this email already exists")
                res.status(response.statusCode).json(response)
                return
            }

            if (!user) {
                const newUserPayload = {
                    name: validatedUser.name,
                    email: validatedUser.email,
                    googleId: validatedUser.googleId,
                    avatarUrl: validatedUser.avatarUrl ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g",
                    isAdmin: validatedUser.isAdmin ?? false,
                    isBlocked: validatedUser.isBlocked ?? false,
                };
                user = await this._userService.createUser(newUserPayload);
            }


            const payload = { id: user!._id, email: user!.email, isAdmin: user!.isAdmin }
            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
            })

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: user!.name,
                    email: user!.email,
                    avatar: user!.avatarUrl,
                    id: user!._id,
                    isAdmin: user!.isAdmin,
                    isPublic: user!.isPublic,
                    accessToken
                },
                "Google Auth Success"
            )
            res.status(response.statusCode).json(response)
            return
        } catch (err) {
            next(err)
        }
    }

    googleLoginAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body
            if (!email) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Email is required")
                res.status(response.statusCode).json(response)
                return
            }

            const user = await this._userService.findUserByEmail(email)
            if (!user) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "User not exists")
                res.status(response.statusCode).json(response)
                return
            }

            if (user.isBlocked) {
                const response = new ApiResponse(HttpStatusCode.FORBIDDEN, { isBlocked: true }, "User is blocked! Can't access")
                res.status(response.statusCode).json(response)
                return
            }

            if (user && !user.googleId) {
                const response = new ApiResponse(HttpStatusCode.CONFLICT, null, "An account with this email already exists")
                res.status(response.statusCode).json(response)
                return
            }

            const payload = { id: user._id, email: user.email, isAdmin: user.isAdmin }
            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
            })

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatarUrl,
                    id: user._id,
                    isAdmin: user.isAdmin,
                    github: user.github,
                    portfolio: user.portfolio,
                    isPublic: user.isPublic,
                    accessToken
                },
                "Google Auth Success"
            )
            res.status(response.statusCode).json(response)
            return
        } catch (err) {
            next(err)
        }
    }

    refreshAccessToken = async (req: Request, res: Response) => {
        try {
            const token = req.cookies.refreshToken
            if (!token) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "Refresh token missing")
                res.status(response.statusCode).json(response)
                return
            }

            const decoded = verifyRefreshToken(token)
            const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email })

            const response = new ApiResponse(HttpStatusCode.OK, { accessToken }, "Access token refreshed")
            res.status(response.statusCode).json(response)
            return

        } catch (err) {
            const response = new ApiResponse(HttpStatusCode.FORBIDDEN, null, "Invalid refresh token")
            res.status(response.statusCode).json(response)
        }
    }

    setNewPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, token } = req.body
            const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

            const resetEntry = await this._userService.findResetToken(hashedToken, email)
            if (!resetEntry || Number(resetEntry.expireAt) < Date.now()) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Invalid or expired token.")
                res.status(response.statusCode).json(response)
                return
            }

            await this._userService.updateUserPassword(email, password)
            await this._userService.deleteResetToken(email)

            const response = new ApiResponse(HttpStatusCode.OK, null, "Password has been reset successfully.")
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, userId } = req.body
            const allUsers = await this._userService.searchAllUsers(email, userId)
            const userEmails = allUsers.map(user => ({ email: user.email, name: user.name, id: user._id }));

            const response = new ApiResponse(HttpStatusCode.OK, userEmails, "Users fetched successfully")
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const userData = req.body
            const updatedUser = await this._userService.updateUser(userId, userData)

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatarUrl,
                    id: updatedUser._id,
                    isAdmin: updatedUser.isAdmin,
                    isPublic: updatedUser.isPublic,
                    github: updatedUser.github,
                    portfolio: updatedUser.portfolio,
                },
                "User updated successfully"
            )
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    getUserData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const updatedUser = await this._userService.getUserData(userId)

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatarUrl,
                    id: updatedUser._id,
                    isAdmin: updatedUser.isAdmin,
                    isPublic: updatedUser.isPublic,
                    github: updatedUser.github,
                    portfolio: updatedUser.portfolio,
                },
                "User data fetched successfully"
            )
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    getContributerDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { id } = req.params

            const contributer = await this._userService.getContributorData(id)
            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: contributer.name,
                    email: contributer.email,
                    avatar: contributer.avatarUrl,
                    id: contributer._id,
                    github: contributer.github,
                    portfolio: contributer.portfolio,
                    isPublic: contributer.isPublic,
                },
                "Contributer data fetched successfully"
            )
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    updateProfileVisiblility = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { isVisible } = req.body
            const id = req.user.id

            await this._userService.updateProfileVisiblity(id, isVisible)
            const response = new ApiResponse(HttpStatusCode.OK, null, "successfully updated profile visibility")
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    getProfileVisibility = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const id = req.user.id

            const user = await this._userService.findUserById(id)
            const result = {
                isVisible: user.isPublic
            }
            const response = new ApiResponse(HttpStatusCode.OK, result, "successfully fetched profile visibility")
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    

}