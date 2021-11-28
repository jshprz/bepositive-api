export interface AccessTokenRepositoryInterface {
  createAccessTokenItem(accesstoken: string, email: string): Promise<boolean>;
  deleteAccessTokenItem(email: string): Promise<boolean>;
}