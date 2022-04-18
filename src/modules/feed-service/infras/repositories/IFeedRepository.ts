import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";
import type { feedTypes } from '../../../types';

interface IFeedRepository {
    create(userId: string, postId: string): UserFeeds;
    getFeed(pagination: {page: number, size: number}, userCognitoSub: string): Promise<feedTypes[]>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<any>;
}

export default IFeedRepository;