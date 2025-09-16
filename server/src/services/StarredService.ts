import mongoose from "mongoose";
import { IStarred } from "../models/StarredModel";
import { IStarredRepository } from "../repositories/interface/IStarredRepository";
import { HttpError } from "../utils/HttpError";
import { IStarredService } from "./interface/IStarredService";
import { IDiscoverRepository } from "../repositories/interface/IDiscoverRepository";


export class StarredService implements IStarredService {
    constructor(
        private readonly _starredRepo: IStarredRepository,
        private readonly _discoveryRepo: IDiscoverRepository
    ) { }

    async getUserStarredSnippets(userId: string): Promise<IStarred[]> {
        try {
            const starredSnipets = await this._starredRepo.getModel().find({ userId })
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
            const isExist = await this._starredRepo.findOne({ userId, projectId });
            if (isExist) {
                throw new HttpError(400, "Project already starred by this user");
            }

            const starredSnipets = await this._starredRepo.create({ userId: new mongoose.Types.ObjectId(userId), projectId: new mongoose.Types.ObjectId(projectId) })
            if (!starredSnipets) {
                throw new HttpError(404, "cannot create snippets ")
            }
            const discoverySnippet = await this._discoveryRepo.findOne({ projectId })
            if (!discoverySnippet) {
                throw new HttpError(404, "Discovery snippet not found~!")
            }
            discoverySnippet.starred += 1
            discoverySnippet.save()

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
            const result = await this._starredRepo.deleteOne({ userId, projectId })

            if (!result) {
                throw new HttpError(404, "Snippet not found ")
            }

            const discoverySnippet = await this._discoveryRepo.findOne({ projectId })
            if (!discoverySnippet) {
                throw new HttpError(404, "Discovery snippet not found~!")
            }
            if (discoverySnippet.starred > 0) {
                discoverySnippet.starred -= 1
                discoverySnippet.save()
            }

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
            const starredSnipets = await this._starredRepo.findById(snippetId)
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