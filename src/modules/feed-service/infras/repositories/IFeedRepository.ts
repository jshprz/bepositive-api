import { UserFeedPost } from "../../../../database/postgresql/models/UserFeedPost";
import type { feedTypes } from '../../../types';
import {UserFeedSharedPost} from "../../../../database/postgresql/models/UserFeedSharedPost";

interface IFeedRepository {
    createFeedForRegularPost(userId: string, postId: string): UserFeedPost;
    createFeedForSharedPost(userId: string, sharedPostId: string): UserFeedSharedPost;
    getFeed(pagination: {page: number, size: number}, userCognitoSub: string): Promise<feedTypes[]>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<feedTypes[]>;
}

export default IFeedRepository;