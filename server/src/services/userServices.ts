import { IUserRepository } from '../repositories/interface/IUserRepository';
import { HttpError } from '../utils/HttpError';
import { UserInput, GoogleAuthInput } from '../validation/userValidation';

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    async createUser(data: UserInput) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new HttpError(409, "User already exists");
        }

        return this.userRepository.create({
            ...data,
            password: data.password
        });
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findByEmail(email);
    }

    async handleGoogleAuth(data: GoogleAuthInput) {
        let user = await this.userRepository.findByGoogleId(data.googleId);
        
        if (!user) {
            // Check if email exists but not with google auth
            user = await this.userRepository.findByEmail(data.email);
            if (user && !user.googleId) {
                throw new HttpError(409, "Email already registered with password");
            }

            user = await this.userRepository.create({
                name: data.name,
                email: data.email,
                googleId: data.googleId,
                avatarUrl: data.avatarUrl,
                isAdmin: data.isAdmin ?? false,
                isBlocked: data.isBlocked ?? false
            });
        }

        return user;
    }
}