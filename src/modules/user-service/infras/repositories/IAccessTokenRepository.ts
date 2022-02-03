import {DeleteResult, InsertResult} from "typeorm";

interface IAccessTokenRepository {
    create(item: {accessToken: string, userCognitoSub: string}): Promise<InsertResult>;
    delete(userCognitoSub: string): Promise<DeleteResult>;
}

export default IAccessTokenRepository;