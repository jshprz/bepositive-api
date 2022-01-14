import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";

interface IFeedRepository {
    create(userId: string, postId: number | undefined): Promise<UserFeeds>;
    getFeed(pagination: {page: number, size: number}, followings: string[] | any): Promise<any>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<any>;
}

export default IFeedRepository;