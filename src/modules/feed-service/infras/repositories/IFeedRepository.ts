import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";

type feedTypes = {
    id: number,
    userId: string,
    caption: string,
    status: string,
    viewCount: number,
    googleMapsPlaceId: string,
    locationDetails: string,
    postMediaFiles: { key: string, type: string }[],
    createdAt: number,
    updatedAt: number,
    user: {}
};

interface IFeedRepository {
    create(userId: string, postId: number): UserFeeds;
    getFeed(pagination: {page: number, size: number}, userCognitoSub: string): Promise<feedTypes[]>;
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<any>;
}

export default IFeedRepository;