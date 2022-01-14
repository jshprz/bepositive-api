import { DeleteResult } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";

interface IPostLikeRepository {
    create(item: {userCognitoSub: string, postId: number}): PostLikes;
    getByIdAndUserId(postId: number, userCognitoSub: string): Promise<any>;
    deleteByIdAndUserId(postId: number, userCognitoSub: string): Promise<DeleteResult>;
}

export default IPostLikeRepository;