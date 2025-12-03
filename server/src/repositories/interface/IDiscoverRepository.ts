import { FilterQuery, Model } from "mongoose";
import { IDiscover } from "../../models/DiscoverModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IDiscoverRepository extends IBaseRepository<IDiscover> {
    create(item: Partial<IDiscover>): Promise<IDiscover>;
    findAll(): Promise<IDiscover[]>;
    getModel(): Model<IDiscover>;
    getTotalPublishedProjects(): Promise<IDiscover[]>;
    countDoc(condition: FilterQuery<IDiscover>): Promise<number>
    getDiscoverStatsByYear(year: number): Promise<{ month: string, snippet: number }[]>
}
