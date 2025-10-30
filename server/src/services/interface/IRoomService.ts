import { IProject } from "../../models/ProjectModel";
import { IRoom } from "../../models/RoomModel";
import { ContributorSummary, IRecentContributedProject } from "../../types/roomTypes";


export interface IRoomService {
    createRoom(projectId: string, ownerId: string): Promise<IRoom>;
    getRoomByProjectId(projectId: string): Promise<IRoom>;
    updateCollabratorRole(roomId: string, userId: string, role: "viewer" | "editor"): Promise<IRoom>
    removeContributer(userId: string, projectId: string): Promise<IRoom>;
    getContributedProjectsDetailsByUserId(userId: string): Promise<{
        projects: IRoom[],
        percentage: number,
        isPositive: boolean
    }>;
    isEligibleToEdit(userId: string, roomId: string): Promise<boolean>;
    getUserRoleInProject(projectId: string, userId: string): Promise<string>;
    getAllContributorsForUser(userId: string): Promise<ContributorSummary[]>
    getContributedProjectsOld(userId: string): Promise<IProject[]>;
    getContributionGraph(userId: string): Promise<{
        monthlyData: { name: string; contributions: number }[];
        yearlyData: { name: string; contributions: number }[];
    }>;
    getRecentContributedProjects(userId: string): Promise<IRecentContributedProject[]>;
    getRoomsByYear(year: number): Promise<{ month: string, rooms: number, contributors: number }[]>;
    getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]>
    getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]>
}