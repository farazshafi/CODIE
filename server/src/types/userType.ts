import { IUserBase } from "../models/UserModel";


export type createUserType = Omit<IUserBase, "isAdmin" | "isBlocked"> & {
    password: string
}

export type updateUser = Partial<Omit<IUserBase, "email">>