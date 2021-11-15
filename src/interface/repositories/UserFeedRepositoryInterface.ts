import { Geometry } from "geojson";

export interface UserFeedRepositoryInterface {
  createFeed(userId: string, postId: number | undefined): Promise<boolean>;
  getFeed(pagination: {page: number, size: number}, followings: string[]): Promise<{
    posts_id: number,
    posts_user_id: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]>;
  getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<{
    id: number,
    user_id: string,
    caption: string,
    status: string,
    view_count: number,
    lat_long: Geometry,
    s3_files: { key: string, type: string }[],
    created_at: number,
    updated_at: number,
    deleted_at: number,
    likes: number
  }[]>;
}