import { Posts } from "../../../../database/postgresql/models/Posts";

interface IFeedRepository {
    create(userId: string, postId: number | undefined);
    getFeed(pagination: {page: number, size: number}, followings: string[] | any): Promise<any>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<any>;
}

export default IFeedRepository;