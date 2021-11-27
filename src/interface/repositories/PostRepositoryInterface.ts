export interface PostRepositoryInterface {
  create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Promise<number | undefined>;
  getPostById(id: number): Promise<{
    id: number | void,
    user_id: string | void,
    caption: string | void,
    status: string | void,
    view_count: number | void,
    google_maps_place_id: string | void,
    s3_files: { key: string, type: string }[] | void,
    created_at: number | void,
    location_details: string
  }>;
  getPostsByUserCognitoSub(userCognitoSub: string): Promise<{
    posts_id: number,
    posts_user_id: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_google_maps_place_id: string,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]>;
  updatePost(id: number, caption: string): Promise<boolean>;
  removePostById(id: number): Promise<boolean>;
}