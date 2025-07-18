import mongoose from "mongoose";
import { IDiscover } from "../../models/discoverModel";


export interface IDiscoverService {
    create(projectId: mongoose.Types.ObjectId): Promise<IDiscover>;
    findDiscoveries(filter: { keyword: string, language: string }, pagination: { page: number, limit: number }): Promise<{ discoveries: IDiscover[]; total: number; totalPages: number; currentPage: number }>
    removeProject(id: string): Promise<void>
}