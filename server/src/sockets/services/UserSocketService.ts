import { IUserSocketRepository } from "../repositories/interface/IUserSocketRepository";
import { IUserSocketService } from "./interface/IUserSocketService";


export class UserSocketService implements IUserSocketService {
    constructor(
        private readonly userSocketRepo: IUserSocketRepository
    ) { }

    async getSocketId(userId: string): Promise<string | undefined> {
        return this.userSocketRepo.getSocketId(userId)
    }
}