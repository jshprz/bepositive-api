export interface AccessTokenRepositoryInterface {
  createAccessTokenItem(accesstoken: string, email: string): Promise<any>;
  deleteAccessTokenItem(email: string): Promise<any>;
}