import { getConnection, InsertResult, DeleteResult } from 'typeorm';
import { AccessTokens } from "../../../../database/postgresql/models/AccessTokens";
import IAccessTokenRepository from "./IAccessTokenRepository";

class AccessTokenRepository implements IAccessTokenRepository {

    constructor() {}

    /**
     * Creates AccessTokens data.
     * @param item: {accessToken: string, userCognitoSub: string}
     * @returns Promise<InsertResult>
     */
    create(item: {accessToken: string, userCognitoSub: string}): Promise<InsertResult> {
        const { accessToken, userCognitoSub } = item;

        return getConnection()
            .createQueryBuilder()
            .insert()
            .into(AccessTokens)
            .values([{
                access_token: accessToken,
                user_id: userCognitoSub,
                created_at: Number(Date.now())
            }]).execute();
    }

    /**
     * Deletes AccessTokens data by email.
     * @param userCognitoSub: string
     * @returns Promise<DeleteResult>
     */
    delete(userCognitoSub: string): Promise<DeleteResult> {
        return getConnection()
            .createQueryBuilder()
            .delete()
            .from(AccessTokens)
            .where('user_id = :userCognitoSub', { userCognitoSub })
            .execute();
    }
}

export default AccessTokenRepository;