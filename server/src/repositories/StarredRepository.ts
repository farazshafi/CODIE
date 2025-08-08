import { Model } from "mongoose";
import { IStarred } from "../models/StarredModel";
import { BaseRepository } from "./BaseRepository";
import { IStarredRepository } from "./interface/IStarredRepository";


export class StarredRepository extends BaseRepository<IStarred> implements IStarredRepository {
    constructor(model: Model<IStarred>) {
        super(model)
    }

    getModel(): Model<IStarred> {
        return this.model
    }

}