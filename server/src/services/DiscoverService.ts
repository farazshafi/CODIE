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
        private readonly _discoverRepo: IDiscoverRepository,
        private readonly _projectRepo: IProjectRepository,
        private readonly _userSubscriptionRepo: IUserSubscriptionRepository,
    ) { }

    async create(projectId: Types.ObjectId, userId: string): Promise<IDiscover> {
        try {
            const projectOwner = (await this._projectRepo.findById(String(projectId))).userId
            if (String(projectOwner) !== userId) {
                throw new HttpError(400, "Only Owner can share snippet")
            }

            const existingSnippet = await this._discoverRepo.findOne({ projectId })
            if (existingSnippet) {
                throw new HttpError(409, "Snippet Already Shared to discovery!")
            }

            return await this._discoverRepo.create({ projectId });
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
        pagination: PaginationOptions,
        sortBy: string
    ): Promise<{ discoveries: IDiscover[]; total: number; totalPages: number; currentPage: number }> {
        try {
            const { keyword, language } = filter;
            const { page, limit } = pagination;

            const skip = (page - 1) * limit;

            let sortOptions = {};
            if (sortBy === 'recent') {
                sortOptions = { createdAt: -1 };
            } else if (sortBy === 'stars') {
                sortOptions = { starred: -1 };
            } else {
                sortOptions = { starred: -1 };
            }

            const discoveries = await this._discoverRepo
                .getModel()
                .find()
                .populate({
                    path: "projectId",
                    select: "_id projectName projectCode projectLanguage userId ",
                    populate: {
                        path: "userId",
                        select: "name"
                    }
                }).sort(sortOptions)

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
            const project = await this._discoverRepo.findById(id)
            if (!project) {
                throw new HttpError(404, "Snippet Not found ")
            }
            await this._discoverRepo.delete(id)
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
            const subscription = await this._userSubscriptionRepo.findOne({ userId })

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
