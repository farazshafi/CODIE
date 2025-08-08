import { IStarred } from "../../models/StarredModel";


export interface IStarredService {
    getUserStarredSnippets(userId: string): Promise<IStarred[]>;
    starASnippet(userId: string, projectId: string): Promise<IStarred>;
    removeSnippet(userId: string, projectId: string): Promise<boolean>;
    getSnippetById(snippetId: string): Promise<IStarred>;
}