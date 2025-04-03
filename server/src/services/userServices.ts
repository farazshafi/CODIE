import { UserRepository } from "../repositories/userRepositories";
import { UserInput } from "../validation/userValidation";

export class UserService {

    static async createUser(user:UserInput) {
        const existingUser = await UserRepository.findByEmail(user.email)
        if (existingUser) throw new Error("User already exists");
        return await UserRepository.addUser(user);
    }


    static async fetchUsers() {
        return await UserRepository.getUsers();
    }
}
