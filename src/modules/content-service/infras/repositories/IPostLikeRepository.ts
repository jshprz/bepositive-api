import { DeleteResult } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";

interface IPostLikeRepository {
    create(userCognitoSub: string, postId: string, classification: string): PostLikes;
    getByIdAndUserId(postId: string, userCognitoSub: string): Promise<any>;
    deleteByIdAndUserId(postId: string, userCognitoSub: string): Promise<DeleteResult>;
}

export default IPostLikeRepository;