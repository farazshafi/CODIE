import mongoose from "mongoose";
import { IDiscover } from "../../models/DiscoverModel";


export interface IDiscoverService {
    create(projectId: mongoose.Types.ObjectId, userId: string): Promise<IDiscover>;
    findDiscoveries(filter: { keyword: string, language: string }, pagination: { page: number, limit: number }, sortBy: string): Promise<{ discoveries: IDiscover[]; total: number; totalPages: number; currentPage: number }>
    removeProject(id: string): Promise<void>;
    getCodeExplanation(code:string, userId:string);
}