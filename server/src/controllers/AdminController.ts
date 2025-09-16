


import { HttpStatusCode } from "../utils/httpStatusCodes";
import { NextFunction, Request, Response } from "express"
import { LoginInput } from "../validation/userValidation"

import { generateAccessToken, generateRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"
import { IProjectService } from "../services/interface/IProjectService"
import { IPaymentService } from "../services/interface/IPaymentService"
import jwt from "jsonwebtoken"
import redis from "../config/redis"


export class AdminController {
    constructor(
        private readonly _userService: IUserService,
        private readonly _projectService: IProjectService,
        private readonly _paymentService: IPaymentService,
    ) { }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this._userService.findUserByEmail(credential.email)

            if (!userExist) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "User not exists" })
                return
            }

            if (!userExist.isAdmin) {
                res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Access denied. Admins only.' });
                return
            }


            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid password or email" })
                return
            }

            const payload = { id: userExist._id, email: userExist.email, isAdmin: userExist.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            res.status(HttpStatusCode.OK).json({
                message: "Login Success",
                data: {
                    name: userExist.name,
                    email: userExist.email,
                    avatar: userExist.avatarUrl,
                    id: userExist._id,
                    isAdmin: userExist.isAdmin
                },
                accessToken
            })

        } catch (err) {
            next(err)
        }
    }

    logoutUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1]

            const decoded = jwt.decode(token)
            console.log("decoded token data", decoded)

            if (!decoded || !decoded.exp) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid token" });
                return
            }

            const expiresAt = decoded.exp
            const ttl = expiresAt - Math.floor(Date.now() / 1000);
            console.log("checking ttl: is grater than 0", ttl)
            if (ttl > 0) {
                await redis.setex(`blacklist:${token}`, ttl, "true")
            }

            res.json({ message: "Logged out successfully" });
        } catch (err) {
            next(err)
        }
    }

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 10, search = '', status = "all" } = req.query;

            // Convert to proper types
            const pageNumber = parseInt(page as string);
            const pageSize = parseInt(limit as string);
            const searchQuery = search.toString();

            const filter: {
                isAdmin: boolean;
                $or?: { [key: string]: { $regex: string; $options: string } }[];
                isBlocked?: boolean;
            } = {
                isAdmin: false,
            };

            if (searchQuery) {
                filter.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } }
                ];
            }

            if (status === 'active') {
                filter.isBlocked = false;
            } else if (status === 'suspended') {
                filter.isBlocked = true;
            }

            // Fetch users with pagination
            const users = await this._userService.findUsersWithPagination(filter, pageNumber, pageSize);

            const totalUsers = await this._userService.countUsers(filter);

            res.status(HttpStatusCode.OK).json({
                message: "Users fetched successfully",
                data: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isBlocked: user.isBlocked,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio
                })),
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(totalUsers / pageSize)
                }
            });
        } catch (err) {
            next(err)
        }
    }

    updateBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, status } = req.body

            const user = this._userService.findUserById(userId)
            if (!user) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "User not found" })
                return
            }

            if (status === "suspend") {
                await this._userService.blockUserById(userId)
                res.status(HttpStatusCode.OK).json({ message: "User Blocked Successfully" })
                return
            } else if (status === "active") {
                await this._userService.unblockUserById(userId)
                res.status(HttpStatusCode.OK).json({ message: "User Unblocked Successfully" })
                return
            }
        } catch (error) {
            next(error)
        }
    }

    getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = await this._userService.adminDashboardUserData()
            const projectData = await this._projectService.adminDashboardProjectData()
            const paymentData = await this._paymentService.adminDashboardPaymenttData()
            res.status(HttpStatusCode.OK).json({ userData, projectData, paymentData })
        } catch (error) {
            next(error)
        }
    }

    getPaymentData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentData = await this._paymentService.getPaymentDataAdmin()
            res.status(HttpStatusCode.OK).json(paymentData)
        } catch (error) {
            next(error)
        }
    }

    updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = req.body
            const paymentData = await this._paymentService.updatePaymentStatus(id, status)
            res.status(HttpStatusCode.OK).json(paymentData)
        } catch (error) {
            next(error)
        }
    }
}
