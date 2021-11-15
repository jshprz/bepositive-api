export interface UserPoolInterface {
  getUserProfile(accesstoken: string): Promise<{Username: string, UserAttributes: []}>;
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