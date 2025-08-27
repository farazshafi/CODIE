import { Types } from "mongoose";
import { IDiscover } from "../models/DiscoverModel";
import { IDiscoverService } from "./interface/IDiscoverService";
import { IDiscoverRepository } from "../repositories/interface/IDiscoverRepository";
import { HttpError } from "../utils/HttpError";
import { generateCodeExplanation } from "../utils/geminiHelperl";
import { IProjectRepository } from "../repositories/interface/IProjectRepository";
import { IUserSubscriptionRepository } from "../repositories/interface/IUserSubscriptionRepository";

interface FilterOptions {
    keyword: string;
    language: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
}

interface PopulatedProject {
    _id: Types.ObjectId;
    projectName: string;
    projectCode: string;
    projectLanguage: string;
    userId: PopulatedUser;
}

export class DiscoverService implements IDiscoverService {
    constructor(
        private readonly discoverRepo: IDiscoverRepository,
        private readonly projectRepo: IProjectRepository,
        private readonly userSubscriptionRepo: IUserSubscriptionRepository,
    ) { }

    async create(projectId: Types.ObjectId, userId: string): Promise<IDiscover> {
        try {
            const projectOwner = (await this.projectRepo.findById(String(projectId))).userId
            if (String(projectOwner) !== userId) {
                throw new HttpError(400, "Only Owner can share snippet")
            }

            const existingSnippet = await this.discoverRepo.findOne({ projectId })
            if (existingSnippet) {
                throw new HttpError(409, "Snippet Already Shared to discovery!")
            }

            return await this.discoverRepo.create({ projectId });
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.log(error)
            throw new HttpError(500, "Server error cannot share to discover");
        }
    }

    async findDiscoveries(
        filter: FilterOptions,
        pagination: PaginationOptions
    ): Promise<{ discoveries: IDiscover[]; total: number; totalPages: number; currentPage: number }> {
        try {
            const { keyword, language } = filter;
            const { page, limit } = pagination;

            const skip = (page - 1) * limit;

            const discoveries = await this.discoverRepo
                .getModel()
                .find()
                .populate({
                    path: "projectId",
                    select: "_id projectName projectCode projectLanguage userId ",
                    populate: {
                        path: "userId",
                        select: "name"
                    }
                }).sort({ starred: -1 })

            const filtered = discoveries.filter((d) => {
                const project = d.projectId as unknown as PopulatedProject;

                const matchKeyword =
                    keyword === "" || project.projectName.toLowerCase().includes(keyword.toLowerCase())

                const matchLanguage =
                    language === "" || project.projectLanguage === language;

                return matchKeyword && matchLanguage;
            });

            const total = filtered.length;
            const totalPages = Math.ceil(total / limit);
            const paginated = filtered.slice(skip, skip + limit);

            return {
                discoveries: paginated,
                total,
                totalPages,
                currentPage: page,
            };
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Server error, cannot get discoveries");
        }
    }

    async removeProject(id: string): Promise<void> {
        try {
            const project = await this.discoverRepo.findById(id)
            if (!project) {
                throw new HttpError(404, "Snippet Not found ")
            }
            await this.discoverRepo.delete(id)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "server error while removing project form discoveies")
        }
    }

    async getCodeExplanation(code: string, userId: string) {
        try {
            const explanation = await generateCodeExplanation(code)
            const subscription = await this.userSubscriptionRepo.findOne({ userId })

            if (!subscription) {
                throw new HttpError(404, "User subscription is not found!")
            }

            subscription.aiUsage += 1
            await subscription.save()

            return explanation
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw error(500, "server Error")
        }
    }
}
