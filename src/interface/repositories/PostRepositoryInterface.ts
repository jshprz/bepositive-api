import { Geometry } from "geojson";
import { Posts } from '../../database/postgresql/models/Posts';

export interface PostRepositoryInterface {
  create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[] }): Promise<number | undefined>;
  getPostById(id: number): Promise<Posts | void>;
  getPostsByUserCognitoSub(userCognitoSub: string): Promise<{
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
  updatePost(id: number, caption: string): Promise<boolean>;
}