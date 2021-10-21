export interface UserFeedRepositoryInterface {
  createFeed(userId: string, postId: number | undefined): Promise<boolean>;
}