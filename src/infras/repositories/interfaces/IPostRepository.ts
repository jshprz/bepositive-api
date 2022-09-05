import { UpdateResult } from "typeorm";
import { Posts } from "../../../database/postgresql/models/Posts";
import { FlaggedPosts } from "../../../database/postgresql/models/FlaggedPosts";
import type { postType, sharedPostType } from "../../../modules/content-service/types";

interface IPostRepository {
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string }): Posts;
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<postType[]>;
    getPostById(id: string): Promise<postType>;
    getSharedPostById(id: string): Promise<sharedPostType>;
    update(id: string, caption: string): Promise<UpdateResult>;
    softDelete(postId: string): Promise<boolean>;
    flagPost(userId: string, postId: string, classification: string, reason: string): FlaggedPosts
}

export default IPostRepository;