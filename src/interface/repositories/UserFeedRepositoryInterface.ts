
export interface UserFeedRepositoryInterface {
  createFeed(userId: string, postId: number | undefined): Promise<boolean>;
  getFeed(pagination: {page: number, size: number}, followings: string[]): Promise<{
    posts_id: number,
    posts_user_id: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_google_maps_place_id: string,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number,
    location_details: string,
    user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
  }[]>;
  getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<{
    id: number,
    user_id: string,
    caption: string,
    status: string,
    view_count: number,
    google_maps_place_id: string,
    s3_files: { key: string, type: string }[],
    created_at: number,
    updated_at: number,
    deleted_at: number,
    likes: number,
    location_details: string,
    user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
  }[]>;
}