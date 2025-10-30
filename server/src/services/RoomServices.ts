import mongoose from "mongoose"
import { IProject } from "../models/ProjectModel"
import { IRoom } from "../models/RoomModel"
import { IProjectRepository } from "../repositories/interface/IProjectRepository"
import { IRoomRepository } from "../repositories/interface/IRoomRepository"
import { CreateRoomType } from "../types/roomType";
import { ContributorSummary, IRecentContributedProject } from "../types/roomTypes";
import { IUser } from "../models/UserModel";
import { generateRoomId } from "../utils/generateRoomId"
import { HttpError } from "../utils/HttpError"
import { IRoomService } from "./interface/IRoomService"
import { logger } from "../utils/logger"

export class RoomServices implements IRoomService {
    constructor(
        private readonly _roomRepository: IRoomRepository,
        private readonly _projectRepository: IProjectRepository
    ) { }

    async createRoom(projectId: string, ownerId: string): Promise<IRoom> {
        try {
            let roomId = generateRoomId()
            const roomData: CreateRoomType = {
                projectId,
                ownerId,
                roomId
            }
            let existRoom = await this._roomRepository.findRoomById(roomId)

            while (existRoom) {
                roomId = generateRoomId();
                existRoom = await this._roomRepository.findRoomById(roomId);
            }

            return await this._roomRepository.createRoom(roomData)
        } catch (err) {
            console.error("Failed when creating room: ", err)
            throw new HttpError(500, "Failed to create room")
        }
    }

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        try {
            const existRoom = await this._roomRepository.getRoomByProjectId(projectId)
            if (!existRoom) {
                return null
            }

            return existRoom
        } catch (err) {
            if (err instanceof HttpError) {
                throw err
            }
            console.error("Failed when getting room: ", err)
            throw new HttpError(500, "failed to get room")
        }
    }

    async updateCollabratorRole(roomId: string, userId: string, role: "viewer" | "editor"): Promise<IRoom> {
        try {
            const room = await this._roomRepository.findOne({ roomId })
            if (!room) {
                throw new HttpError(404, "Room Not Found!")
            }

            return this._roomRepository.findRoomAndUpdateRole(roomId, role, userId)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log("Error while updating role", error)
            throw new HttpError(500, "Error while updating role")
        }
    }


    async getContributedProjectsDetailsByUserId(userId: string): Promise<{
        projects: IRoom[],
        percentage: number,
        isPositive: boolean
    }> {
        try {
            const rooms = await this._roomRepository.find({
                "collaborators.user": new mongoose.Types.ObjectId(userId),
                owner: { $ne: new mongoose.Types.ObjectId(userId) }
            });

            const now = new Date();
            const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
            const lastMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));


            let thisMonthContributions = 0;
            let lastMonthContributions = 0;

            rooms.forEach(room => {
                const collaborator = room.collaborators.find(c => c.user.toString() === userId);
                if (collaborator && collaborator.joinedAt) {
                    const joinedDate = new Date(collaborator.joinedAt);
                    if (joinedDate >= thisMonthStart && joinedDate <= now) {
                        thisMonthContributions++;
                    } else if (joinedDate >= lastMonthStart && joinedDate <= lastMonthEnd) {
                        lastMonthContributions++;
                    }
                }
            });



            let percentage = 0;
            if (lastMonthContributions > 0) {
                percentage = ((thisMonthContributions - lastMonthContributions) / lastMonthContributions) * 100;
            } else if (thisMonthContributions > 0) {
                percentage = 100;
            }

            const isPositive = thisMonthContributions > lastMonthContributions;



            const projects = await this._roomRepository.getContributedProjects(userId)
            return {
                projects,
                percentage,
                isPositive
            }
        } catch (error) {
            console.log("Occured whiel getting contributed projects", error)
            throw new HttpError(500, "Occured whiel getting contributed projects")
        }
    }

    async getContributedProjectsOld(userId: string): Promise<IProject[]> {
        try {
            const rooms = await this._roomRepository.find({
                "collaborators.user": new mongoose.Types.ObjectId(userId),
                owner: { $ne: new mongoose.Types.ObjectId(userId) }
            });
            const projectIds = rooms.map(room => room.projectId.toString());
            return await this._projectRepository.getProjectByIds(projectIds)
        } catch (error) {
            console.log("Occured whiel getting contributed projects", error)
            throw new HttpError(500, "Occured whiel getting contributed projects")
        }
    }

    async isEligibleToEdit(userId: string, roomId: string): Promise<boolean> {
        try {
            const room = await this._roomRepository.findOne({ roomId })
            if (!room) {
                throw new HttpError(404, "Room Not found!")
            }

            const collaborator = room.collaborators.find(c => c.user._id.toString() === userId)
            if (!collaborator) {
                throw new HttpError(404, "User not found in collabrators")
            }

            return collaborator.role === "owner" || collaborator.role === "editor" ? true : false
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Cannot check permission")
        }
    }

    async getUserRoleInProject(projectId: string, userId: string): Promise<string> {
        try {
            const room = await this._roomRepository.findOne({ projectId })
            if (!room) {
                throw new HttpError(404, "Room not found")
            }
            const isOwner = room.owner.toString() === userId
            if (isOwner) {
                return "owner"
            }

            const role = await this._roomRepository.findContributerRole(userId, projectId)
            return role

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Error While getting role")
        }
    }

    async removeContributer(userId: string, projectId: string): Promise<IRoom> {
        try {
            const updatedContributers = await this._roomRepository.removeUserFromCollabrators(userId, new mongoose.Types.ObjectId(projectId))
            if (!updatedContributers) {
                throw new HttpError(404, "Cannot find User in contributers")
            }
            return updatedContributers
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Cannot remove Contributer from room")
            console.log("cannot remove contributer from room", error)
        }
    }

    async getAllContributorsForUser(userId: string): Promise<ContributorSummary[]> {
        type PopulatedUser = Pick<IUser, '_id' | 'name' | 'email' | 'avatarUrl'>;
        const rooms = await this._roomRepository.getModel()
            .find({ owner: new mongoose.Types.ObjectId(userId) })
            .populate({
                path: "collaborators.user",
                select: "name email avatarUrl",
            });

        const contributorMap = new Map();

        rooms.forEach(room => {
            room.collaborators.forEach(collab => {
                const user = collab.user as unknown as PopulatedUser;
                if (!user) return;

                if (user._id.toString() === room.owner.toString()) return;

                if (!contributorMap.has(user._id.toString())) {
                    contributorMap.set(user._id.toString(), {
                        userId: user._id,
                        name: user.name,
                        avatar: user.avatarUrl || "",
                        totalContributions: 0,
                        roles: [],
                    });
                }

                const contributor = contributorMap.get(user._id.toString());
                contributor.totalContributions += 1;
                contributor.roles.push({
                    projectId: room.projectId,
                    role: collab.role,
                });
            });
        });

        return Array.from(contributorMap.values());
    }

    async getContributionGraph(userId: string): Promise<{ monthlyData: { name: string; contributions: number }[]; yearlyData: { name: string; contributions: number }[] }> {
        try {
            const contributedProjects = await this._roomRepository.getContributedProjects(userId)

            const monthlyMap: Record<string, number> = {};
            const yearlyMap: Record<string, number> = {};

            contributedProjects.forEach((room) => {
                const collaborator = room.collaborators?.find(
                    (c) => c.user.toString() === userId
                );
                const date = collaborator?.joinedAt || new Date();

                const month = date.toLocaleString("en", { month: "short" });
                const year = date.getFullYear().toString();

                monthlyMap[month] = (monthlyMap[month] || 0) + 1;
                yearlyMap[year] = (yearlyMap[year] || 0) + 1;
            });

            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyData = monthOrder.map((m) => ({
                name: m,
                contributions: monthlyMap[m] || 0,
            }));

            const yearlyData = Object.keys(yearlyMap)
                .sort()
                .map((year) => ({
                    name: year,
                    contributions: yearlyMap[year],
                }));

            return { monthlyData, yearlyData };
        } catch (err) {
            logger.error(`Error while fetching contribution graph ${err}`)
            throw new HttpError(500, "Error while fetching contribution graph")
        }
    }

    async getRecentContributedProjects(userId: string): Promise<IRecentContributedProject[]> {
        try {
            const projects = await this._roomRepository.getRecentContributedProjects(userId, 3)
            console.log("Recent contributed projects:", projects);
            return projects;
        } catch (error) {
            logger.error(`Error while getting recent contributed projects ${error}`);
            console.log("error while getting recent contributedd projects ", error)
            throw new HttpError(500, "Error while getting recent contributed projects");
        }
    }


    async getRoomsByYear(year: number): Promise<{ month: string; rooms: number; contributors: number }[]> {
        try {
            return await this._roomRepository.getRoomsByYear(year)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error);
            logger.error("Error while Fetching room graph")
            throw new HttpError(500, "Server error while Fetching room graph");
        }
    }

    async getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]> {
        return this._roomRepository.getMontlyDataForGraphOverview(year)
    }

    async getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]> {
        return this._roomRepository.getYearlyDataForGraphOverview()
    }
}

