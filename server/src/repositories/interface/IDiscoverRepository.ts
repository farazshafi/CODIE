import { Model } from "mongoose";
import { IDiscover } from "../../models/discoverModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IDiscoverRepository extends IBaseRepository<IDiscover> {
    create(item: Partial<IDiscover>): Promise<IDiscover>;
    findAll(): Promise<IDiscover[]>;
    getModel(): Promise<IDiscover>;
}