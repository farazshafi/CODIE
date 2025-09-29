import { IComment } from "../../models/CommentModel";


export interface ICommentService {
    createComment(userId: string, comment: string, projectId: string): Promise<IComment>
    getComments(projectId: string): Promise<IComment[]>;
    toggleLikeComment(commentId: string, userId: string): Promise<IComment>;
}