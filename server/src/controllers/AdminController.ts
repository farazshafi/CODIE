

import { NextFunction, Request, Response } from "express"
import { LoginInput } from "../validation/userValidation"

import { generateAccessToken, generateRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"
import { IProjectService } from "../services/interface/IProjectService"
import { IPaymentService } from "../services/interface/IPaymentService"


export class AdminController {
    constructor(
        private readonly userService: IUserService,
        private readonly projectService: IProjectService,
        private readonly paymentService: IPaymentService,
    ) { }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this.userService.findUserByEmail(credential.email)

            if (!userExist) {
                res.status(400).json({ message: "User not exists" })
                return
            }

            if (!userExist.isAdmin) {
                res.status(403).json({ message: 'Access denied. Admins only.' });
                return
            }


            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                res.status(401).json({ message: "Invalid password or email" })
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

            res.status(200).json({
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
            const users = await this.userService.findUsersWithPagination(filter, pageNumber, pageSize);

            const totalUsers = await this.userService.countUsers(filter);

            res.status(200).json({
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

            const user = this.userService.findUserById(userId)
            if (!user) {
                res.status(404).json({ message: "User not found" })
                return
            }

            if (status === "suspend") {
                await this.userService.blockUserById(userId)
                res.status(200).json({ message: "User Blocked Successfully" })
                return
            } else if (status === "active") {
                await this.userService.unblockUserById(userId)
                res.status(200).json({ message: "User Unblocked Successfully" })
                return
            }
        } catch (error) {
            next(error)
        }
    }

    getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = await this.userService.adminDashboardUserData()
            const projectData = await this.projectService.adminDashboardProjectData()
            const paymentData = await this.paymentService.adminDashboardPaymenttData()
            res.status(200).json({ userData, projectData, paymentData })
        } catch (error) {
            next(error)
        }
    }

    getPaymentData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentData = await this.paymentService.getPaymentDataAdmin()
            res.status(200).json(paymentData)
        } catch (error) {
            next(error)
        }
    }

    updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = req.body
            const paymentData = await this.paymentService.updatePaymentStatus(id, status)
            res.status(200).json(paymentData)
        } catch (error) {
            next(error)
        }
    }
}