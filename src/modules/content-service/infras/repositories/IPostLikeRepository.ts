import { DeleteResult } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";
import type { getPostLikeType } from "../../../types";

interface IPostLikeRepository {
    create(userCognitoSub: string, postId: string, classification: string): PostLikes;
    getByIdAndUserId(postId: string, userCognitoSub: string): Promise<getPostLikeType | number>;
    deleteByIdAndUserId(postId: string, userCognitoSub: string): Promise<DeleteResult>;
}

export default IPostLikeRepository;