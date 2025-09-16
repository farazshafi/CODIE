import { IUserSocketRepository } from "../repositories/interface/IUserSocketRepository";
import { IUserSocketService } from "./interface/IUserSocketService";


export class UserSocketService implements IUserSocketService {
    constructor(
        private readonly _userSocketRepo: IUserSocketRepository
    ) { }

    async getSocketId(userId: string): Promise<string | undefined> {
        return this._userSocketRepo.getSocketId(userId)
    }
}