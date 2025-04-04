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
}
