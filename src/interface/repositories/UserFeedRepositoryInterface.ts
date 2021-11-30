
export interface UserFeedRepositoryInterface {
  createFeed(userId: string, postId: number | undefined): Promise<boolean>;
  getFeed(pagination: {page: number, size: number}, followings: string[]): Promise<{
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