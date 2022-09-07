import { UpdateResult } from "typeorm";
import { CommentReplies } from "../../../database/postgresql/models/CommentReplies";
import { Comments } from "../../../database/postgresql/models/Comments";
import type { getCommentByIdResult, getCommentsByPostIdReturnType, getCommentRepliesByCommentIdReturnType } from '../../../modules/comment-service/types';

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: string, content: string}): Comments;
    getCommentById(id: string, userId: string, type:string): Promise<getCommentByIdResult>;
    getCommentOrCommentReplyIdsById(id: string): Promise<{id: string}[]>;
    getCommentsByPostId(postId: string): Promise<getCommentsByPostIdReturnType[]>;
    getCommentRepliesByCommentId(commentId: string): Promise<getCommentRepliesByCommentIdReturnType[]>;
    update(id: string, userId: string, content: string, type: string): Promise<UpdateResult>;
    softDelete(id: string, type: string): Promise<boolean>;
    replyToComment(item: { commentId: string, userCognitoSub: string, content: string }): CommentReplies;
}

export default ICommentRepository;