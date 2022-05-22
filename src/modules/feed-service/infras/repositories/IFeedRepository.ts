import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";
import type { feedTypes, feedRawType } from '../../../types';

interface IFeedRepository {
    create(userId: string, postId: string, isRegularPost: boolean): UserFeeds;
    getFeed(pagination: {page: number, size: number}, userCognitoSub: string): Promise<feedTypes[]>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<feedTypes[]>;
    getFeedsByPostId(postId: string): Promise<feedRawType[]>;
    softDeleteFeedById(id: string): Promise<boolean>;
}

export default IFeedRepository;