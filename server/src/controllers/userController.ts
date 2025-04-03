import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userServices";
import { UserInput, userSchema } from "../validation/userValidation";


/**
 * @route   POST /api/users
 * @desc    Creates a new user
 * @access  Public
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedUser: UserInput = userSchema.parse(req.body)

        const newUser = await UserService.createUser(validatedUser);
        
        res.status(201).json({ message: "User created successfully", data: newUser });
    } catch (error) {
        next(error);
    }
};



/**
 * @desc Fetches all users from the database. This function is used as a GraphQL resolver.
 * @access Admin
 * @throws {Error} If there is a database error
 */
export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await UserService.fetchUsers();
        res.status(200).json({ data: users });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};
