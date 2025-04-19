import { UserInput } from "../validation/userValidation";
import User, { UserDocument, UserType } from "../models/userModel";

export class UserRepository {
    static async addUser(user: UserInput) {
        try {
            const existingUser = await this.findByEmail(user.email)
            if (existingUser) return null;

            const newUser = await User.create(user)



            return newUser;
        } catch (error) {
            console.error("Database Error (addUser):", error);
            throw new Error("Database error while adding a user");
        }
    }

    static async getUsers(): Promise<UserType[]> {
        try {
            return await User.find({ isAdmin: false }) 
        } catch (error) {
            console.error("Database Error (getUsers):", error);
            throw new Error("Database error while fetching users");
        }
    }

    static async findByEmail(email: string): Promise<UserType | null> {
        try {
            const existingUser = await User.findOne({ email }) as UserDocument
            return existingUser ? existingUser : null;
        } catch (err) {
            console.error("Database Error (findByEmail):", err);
            throw new Error("Database error while fetching user by email");
        }
    }
}
