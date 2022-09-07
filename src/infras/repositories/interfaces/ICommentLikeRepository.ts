import { DeleteResult } from "typeorm";
import { CommentLikes } from "../../../database/postgresql/models/CommentLikes";

interface ICommentLikeRepository {
    create(commentId: string, postId: string, userCognitoSub: string, classification: string): CommentLikes;
    getByIdAndUserId(commentId: string, userCognitoSub: string): Promise<any>;
    deleteByIdAndUserId(commentId: string, userCognitoSub: string): Promise<DeleteResult>;
}

export default ICommentLikeRepository;