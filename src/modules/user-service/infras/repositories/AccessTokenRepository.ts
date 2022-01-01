import { getConnection, InsertResult, DeleteResult } from 'typeorm';
import { AccessTokens } from "../../../../database/postgresql/models/AccessTokens";
import IAccessTokenRepository from "./IAccessTokenRepository";

class AccessTokenRepository implements IAccessTokenRepository {

    constructor() {}

    /**
     * Creates AccessTokens data.
     * @param item: {accessToken: string, email: string}
     * @returns Promise<InsertResult>
     */
    create(item: {accessToken: string, email: string}): Promise<InsertResult> {
        const { accessToken, email } = item;

        return getConnection()
            .createQueryBuilder()
            .insert()
            .into(AccessTokens)
            .values([{
                accessToken,
                email,
                created_at: Number(Date.now())
            }]).execute();
    }

    /**
     * Deletes AccessTokens data by email.
     * @param email: string
     * @returns Promise<DeleteResult>
     */
    delete(email: string): Promise<DeleteResult> {
        return getConnection()
            .createQueryBuilder()
            .delete()
            .from(AccessTokens)
            .where('email = :email', { email })
            .execute();
    }
}

export default AccessTokenRepository;