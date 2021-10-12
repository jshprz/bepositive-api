import { Geometry } from "geojson";
export interface PostRepositoryInterface {
  create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[] }): Promise<string>;
  getPostsByUserCognitoSub(userCognitoSub: string): Promise<{
    posts_id: number,
    posts_user_cognito_sub: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]>;
}