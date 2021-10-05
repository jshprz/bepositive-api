export interface PostRepositoryInterface {
  create(item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }): Promise<string>;
}