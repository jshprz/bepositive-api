export interface UserRelationshipRepositoryInterface {
  getFollowers(userCognitoSub: string): Promise<{
    user_relationships_id: number,
    user_relationships_user_id: string,
    user_relationships_following_id: string,
    user_relationships_created_at: number,
    user_relationships_updated_at: number,
    user_relationships_deleted_at: number
  }[]>;
}