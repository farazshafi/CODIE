import mongoose, { Model } from "mongoose";
import { IRoom } from "../../models/RoomModel";
import { CreateRoomType } from "../../types/roomType";
import { IBaseRepository } from "./IBaseRepository";
import { IRecentContributedProject } from "../../types/roomTypes";


export interface IRoomRepository extends IBaseRepository<IRoom> {
    createRoom({ roomId, projectId, ownerId }: CreateRoomType): Promise<IRoom>;
    findRoomById(roomId: string): Promise<IRoom>;
    addUserToCollabrators(userId: string, roomId: string): Promise<IRoom>;
    removeUserFromCollabrators(userId: string, projectId: mongoose.Types.ObjectId): Promise<IRoom>;
    getRoomByProjectId(projectId: string): Promise<IRoom>;
    getOwnderByRoomId(roomId: string): Promise<string>;
    findRoomAndUpdateRole(roomId: string, role: "viewer" | "editor", userId: string): Promise<IRoom>;
    findContributerRole(userId: string, projectId: string): Promise<"owner" | "editor" | "viewer">;
    findRoomByProjIdAndDlt(projectId: string): Promise<boolean>;
    getProjectIdByRoomId(roomId: string): Promise<IRoom>;
    getModel(): Model<IRoom>;
    getContributedProjects(userId: string): Promise<IRoom[]>;
    getRecentContributedProjects(userId: string, limit: number): Promise<IRecentContributedProject[]>;
    getRoomsByYear(year: number): Promise<{ month: string, rooms: number, contributors: number }[]>;
    getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]>
    getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]>

}