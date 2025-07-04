import { IRoom } from "../../models/roomModel";
import { CreateRoomType } from "../../types/roomType";
import { IBaseRepository } from "./IBaseRepository";


export interface IRoomRepository extends IBaseRepository<IRoom> {
    createRoom({ roomId, projectId, ownerId }: CreateRoomType): Promise<IRoom>;
    findRoomById(roomId: string): Promise<IRoom>;
    addUserToCollabrators(userId: string, roomId: string): Promise<IRoom>;
    getRoomByProjectId(projectId: string): Promise<IRoom>;
    getOwnderByRoomId(roomId: string): Promise<string>;
    findRoomAndUpdateRole(roomId: string, role: "viewer" | "editor", userId: string): Promise<IRoom>;
    findContributerRole(userId: string, projectId: string): Promise<"owner" | "editor" | "viewer">;
    findRoomByProjIdAndDlt(projectId: string): Promise<boolean>;
    getProjectIdByRoomId(roomId: string): Promise<IRoom>;
}