import {DeleteResult, InsertResult} from "typeorm";

interface IAccessTokenRepository {
    create(item: {accessToken: string, email: string}): Promise<InsertResult>;
    delete(email: string): Promise<DeleteResult>;
}

export default IAccessTokenRepository;