import { DeleteResult } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";

interface IPostLikeRepository {
    create(item: {userCognitoSub: string, postId: string}): PostLikes;
    getByIdAndUserId(postId: string, userCognitoSub: string): Promise<any>;
    deleteByIdAndUserId(postId: string, userCognitoSub: string): Promise<DeleteResult>;
}

export default IPostLikeRepository;