export interface AccessTokenRepositoryInterface {
  createAccessTokenItem(accessToken: string, email: string): Promise<boolean>;
  deleteAccessTokenItem(email: string): Promise<boolean>;
}