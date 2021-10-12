export interface UserPoolInterface {
  getUserProfile(accesstoken: string): Promise<{Username: string, UserAttributes: []}>;
}