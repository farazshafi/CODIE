import { IDiscover } from "../../models/DiscoverModel";
import { IGetDashboardOverview } from "../../types/adminTypes";

export interface IAdminService {
    getTotalPublishedSnippets(): Promise<IDiscover[]>;
    getDashboardOverview(year: number): Promise<IGetDashboardOverview>;
}