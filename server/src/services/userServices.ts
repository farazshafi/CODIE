import { UserRepository } from "../repositories/userRepositories";
import { HttpError } from "../utils/HttpError";
import { UserInput } from "../validation/userValidation";

export class UserService {

    static async createUser(user: UserInput) {
        const existingUser = await UserRepository.findByEmail(user.email)
        if (existingUser) throw new HttpError(409, "User Already Exist")
        return await UserRepository.addUser(user);
    }

    static async fetchUsers() {
        return await UserRepository.getUsers();
    }

    static async findUserByEmail(email: string) {
        const user = await UserRepository.findByEmail(email)
        if (!user) throw new HttpError(404, "User not found")
        return user
    }
}
