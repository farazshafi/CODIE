import mongoose from "mongoose";
import { IStarred } from "../models/StarredModel";
import { IStarredRepository } from "../repositories/interface/IStarredRepository";
import { HttpError } from "../utils/HttpError";
import { IStarredService } from "./interface/IStarredService";


export class StarredService implements IStarredService {
    constructor(
        private readonly starredRepo: IStarredRepository,
    ) { }

    async getUserStarredSnippets(userId: string): Promise<IStarred[]> {
        try {
            const starredSnipets = await this.starredRepo.getModel().find({ userId })
                .populate({
                    path: "projectId",
                    select: "_id projectName projectCode projectLanguage userId",
                    populate: {
                        path: "userId",
                        select: "name"
                    }
                })
                .lean();
            if (!starredSnipets) {
                throw new HttpError(404, "starred snippets not found ")
            }
            return starredSnipets
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "server error , cannot get starred snippets")
        }
    }

    async starASnippet(userId: string, projectId: string): Promise<IStarred> {
        try {
            const isExist = await this.starredRepo.findOne({ userId, projectId });
            if (isExist) {
                throw new HttpError(400, "Project already starred by this user");
            }

            const starredSnipets = await this.starredRepo.create({ userId: new mongoose.Types.ObjectId(userId), projectId: new mongoose.Types.ObjectId(projectId) })
            if (!starredSnipets) {
                throw new HttpError(404, "cannot create snippets ")
            }
            return starredSnipets
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "server error , cannot create starred snippets")
        }
    }

    async removeSnippet(userId: string, projectId: string): Promise<boolean> {
        try {
            const result = await this.starredRepo.deleteOne({ userId, projectId })
            return result;

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "server error , cannot delete starred snippets")
        }
    }

    async getSnippetById(snippetId: string): Promise<IStarred> {
        try {
            const starredSnipets = await this.starredRepo.findById(snippetId)
            if (!starredSnipets) {
                throw new HttpError(404, "Cannot find starred snippet")
            }
            return starredSnipets
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "server error , cannot get starred snippets")
        }
    }
}