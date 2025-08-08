import { Model } from "mongoose";
import { IStarred } from "../../models/StarredModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IStarredRepository extends IBaseRepository<IStarred> {
    getModel(): Model<IStarred>;
}