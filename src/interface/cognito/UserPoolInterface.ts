export interface UserPoolInterface {
  getUserProfile(accessToken: string): Promise<{Username: string, UserAttributes: []}>;
  getUser(sub:string): Promise<{
    username: string,
    sub: string,
    email_verified: string,
    name: string,
    email: string,
    dateCreated: Date,
    dateModified: Date,
    enabled: boolean,
    status: string
  }>;
}