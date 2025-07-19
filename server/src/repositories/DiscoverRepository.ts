import { Model } from "mongoose";
import { IDiscover } from "../models/DiscoverModel";
import { BaseRepository } from "./BaseRepository";
import { IDiscoverRepository } from "./interface/IDiscoverRepository";


export class DiscoverRepository extends BaseRepository<IDiscover> implements IDiscoverRepository {
    constructor(model: Model<IDiscover>) {
        super(model)
    }
    getModel(): Model<IDiscover> {
        return this.model
    }
}