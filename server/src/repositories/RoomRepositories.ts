import mongoose, { Model, Types } from "mongoose"
import Room, { IRoom } from "../models/RoomModel"
import { CreateRoomType } from "../types/roomType"
import { BaseRepository } from "./BaseRepository"
import { IRoomRepository } from "./interface/IRoomRepository"
import { IRecentContributedProject } from "../types/roomTypes"

export class RoomRepositories extends BaseRepository<IRoom> implements IRoomRepository {
    constructor(model: Model<IRoom>) {
        super(model)
    }

    async createRoom({ roomId, projectId, ownerId }: CreateRoomType): Promise<IRoom> {
        return await Room.create({
            roomId,
            projectId,
            owner: ownerId,
            collaborators: [{ user: ownerId, role: "owner", joinedAt: new Date() }]
        })
    }

    getModel(): Model<IRoom> {
        return this.model
    }

    async findRoomById(roomId: string): Promise<IRoom> {
        return await Room.findOne({ roomId }).populate("collaborators.user")
    }

    async addUserToCollabrators(userId: string, roomId: string): Promise<IRoom> {
        return await Room.findOneAndUpdate(
            { roomId },
            { $addToSet: { collaborators: { user: userId, role: "viewer", joinedAt: new Date() } } },
            { new: true }
        ).populate([
            { path: "collaborators.user", select: "name" },
            { path: "owner", select: "name" }
        ])
    }

    async removeUserFromCollabrators(userId: string, projectId: mongoose.Types.ObjectId): Promise<IRoom> {
        return await Room.findOneAndUpdate(
            { projectId },
            { $pull: { collaborators: { user: userId, role: "viewer" } } },
            { new: true }
        )
    }

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        const room = await Room.findOne({ projectId });

        if (!room) {
            return null;
        }

        await room.populate("collaborators.user", "name email");

        return room;
    }

    async getOwnderByRoomId(roomId: string): Promise<string> {
        return (await Room.findOne({ roomId })).owner.toString()
    }

    async findRoomAndUpdateRole(roomId: string, role: "viewer" | "editor", userId: string): Promise<IRoom> {
        return await Room.findOneAndUpdate(
            { roomId, "collaborators.user": userId },
            { $set: { "collaborators.$.role": role } },
            { new: true }
        )
    }

    async findContributerRole(userId: string, projectId: string): Promise<"owner" | "editor" | "viewer"> {
        const room = await Room.findOne({ projectId })

        const collaborator = room.collaborators.find(c => c.user.toString() === userId)
        if (collaborator) {
            return collaborator.role
        }
    }

    async findRoomByProjIdAndDlt(projectId: string): Promise<boolean> {
        const result = await Room.deleteOne({ projectId });
        return result.deletedCount > 0;
    }

    async getProjectIdByRoomId(roomId: string): Promise<IRoom> {
        return (await Room.findOne({ roomId }))
    }

    async getContributedProjects(userId: string): Promise<IRoom[]> {
        return await this.model.find({ "collaborators": { "$elemMatch": { "user": new Types.ObjectId(userId), "role": { "$ne": "owner" } } } })
    }

    async getRecentContributedProjects(userId: string, limit = 3): Promise<IRecentContributedProject[]> {
        const userObjectId = new Types.ObjectId(userId);

        const projects = await this.model.aggregate<IRecentContributedProject>([
            {
                $match: {
                    collaborators: {
                        $elemMatch: { user: userObjectId, role: { $ne: "owner" } },
                    },
                },
            },
            {
                $addFields: {
                    contributionsCount: { $size: "$collaborators" },
                },
            },
            { $unwind: "$collaborators" },
            { $match: { "collaborators.user": userObjectId } },
            { $sort: { "collaborators.joinedAt": -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "_id",
                    as: "project",
                },
            },
            { $unwind: "$project" },
            {
                $lookup: {
                    from: "starreds",
                    localField: "project._id",
                    foreignField: "projectId",
                    as: "stars",
                },
            },
            {
                $addFields: {
                    starsCount: { $size: "$stars" },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$project.projectName",
                    language: "$project.projectLanguage",
                    contributions: "$contributionsCount",
                    stars: "$starsCount",
                },
            },
        ]);

        return projects;
    }

    async getRoomsByYear(year: number): Promise<{ month: string, rooms: number, contributors: number }[]> {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;

        const roomData = await this.model.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    allContributors: {
                        $setUnion: [
                            ["$owner"],
                            { $map: { input: "$collaborators", as: "c", in: "$$c.user" } }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$month",
                    rooms: { $sum: 1 },
                    contributorsSet: { $addToSet: "$allContributors" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    rooms: 1,
                    contributors: {
                        $size: {
                            $reduce: {
                                input: "$contributorsSet",
                                initialValue: [],
                                in: { $setUnion: ["$$value", "$$this"] }
                            }
                        }
                    }
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const result = monthNames.slice(0, currentMonth).map((name, index) => {
            const monthInfo = roomData.find(d => d.month === index + 1);
            return {
                month: name,
                rooms: monthInfo ? monthInfo.rooms : 0,
                contributors: monthInfo ? monthInfo.contributors : 0
            };
        });

        return result;
    }

    async getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]> {
        return await this.model.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

    }

    async getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]> {
        return await this.model.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);
    }


}