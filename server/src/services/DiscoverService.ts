import { Types } from "mongoose";
import { IDiscover } from "../models/discoverModel";
import { IDiscoverService } from "./interface/IDiscoverService";
import { IDiscoverRepository } from "../repositories/interface/IDiscoverRepository";
import { HttpError } from "../utils/HttpError";

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
    constructor(private readonly discoverRepo: IDiscoverRepository) { }

    async create(projectId: Types.ObjectId): Promise<IDiscover> {
        try {
            return await this.discoverRepo.create({ projectId });
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
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
                    select: "_id projectName projectCode projectLanguage userId",
                    populate: {
                        path: "userId",
                        select: "name"
                    }
                })
                .lean();

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
}
