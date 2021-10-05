export interface UserPoolInterface {
  getUserProfile(accesstoken: string): Promise<any>;
}