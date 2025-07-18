import { Model } from "mongoose";
import { IDiscover } from "../models/discoverModel";
import { BaseRepository } from "./baseRepository";
import { IDiscoverRepository } from "./interface/IDiscoverRepository";


export class DiscoverRepository extends BaseRepository<IDiscover> implements IDiscoverRepository {
    constructor(model: Model<IDiscover>) {
        super(model)
    }
    getModel(): Promise<IDiscover> {
        return this.model
    }
}