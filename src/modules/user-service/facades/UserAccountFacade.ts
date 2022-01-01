import IAwsCognito from '../infras/aws/IAwsCognito';
import IUserRelationshipRepository from "../infras/repositories/IUserRelationshipRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";

class UserAccountFacade {
    private _log;

    constructor(private _awsCognito: IAwsCognito, private _userRelationshipRepository: IUserRelationshipRepository) {
        this._log = Logger.createLogger('UserAccountFacade.ts');
    }

    /**
     * Gets user information from AWS Cognito using access token
     * @param accessToken: string
     * @returns Promise<{Username: string, UserAttributes: []}>
     */
    getUserProfile(accessToken: string): Promise<{Username: string, UserAttributes: []}> {
        return new Promise(async (resolve, reject) => {
            const params = { AccessToken: accessToken};
            this._awsCognito.getAwsCognitoClient().getUser(params, (error: Error, result: {Username: string, UserAttributes: []}) => {
                if (error) {
                    this._log.error({
                        message: error,
                        payload: accessToken
                    });

                    return reject(Error.AWS_COGNITO_ERROR);
                } else {
                    return resolve(result);
                }
            });
        });
    }

    /**
     * Gets user information from AWS Cognito using sub by filtering from  the ListUsers API
     * @param sub string
     * @returns Promise<{
     *         username: string,
     *         sub: string,
     *         email_verified: string,
     *         name: string,
     *         email: string,
     *         dateCreated: Date,
     *         dateModified: Date,
     *         enabled: boolean,
     *         status: string
     * }>
     */
    getUser(sub: string): Promise<{
        username: string,
        sub: string,
        email_verified: string,
        name: string,
        email: string,
        dateCreated: Date,
        dateModified: Date,
        enabled: boolean,
        status: string
    }> {
        return new Promise(async (resolve, reject) => {
            const params = { Filter: `sub = "${sub}"`, UserPoolId: process.env.AWS_COGNITO_POOL_ID }

            this._awsCognito.getAwsCognitoClient().listUsers(params, (error:Error, result:any) => {
                if (error) {
                    this._log.error({
                        message: error,
                        payload: {"sub": sub}
                    });

                    return reject(Error.AWS_COGNITO_ERROR);
                } else {
                    if (!result.Users.length) {
                        return reject(Error.AWS_COGNITO_ERROR);
                    } else {
                        const rawUser = result.Users[0];
                        const user:any | {} = {};
                        user.username = rawUser.Username;
                        rawUser.Attributes.forEach(attr => {
                            user[attr.Name] = attr.Value;
                        });
                        user.dateCreated = rawUser.UserCreateDate;
                        user.dateModified = rawUser.UserLastModifiedDate;
                        user.enabled = rawUser.Enabled;
                        user.status = rawUser.UserStatus;

                        return resolve(user);
                    }
                }
            });
        });
    }

    /**
     * Gets user followers.
     * @param userCognitoSub: string
     * @returns Promise<{
     * user_relationships_id: number,
     * user_relationships_user_id: string,
     * user_relationships_following_id: string,
     * user_relationships_created_at: number,
     * user_relationships_updated_at: number,
     * user_relationships_deleted_at: number
     * }[]>
     */
    getFollowers(userCognitoSub: string): Promise<{
        user_relationships_id: number,
        user_relationships_user_id: string,
        user_relationships_following_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
    }[]> {

        return new Promise(async (resolve, reject) => {
            const followers: {
                user_relationships_id: number,
                user_relationships_user_id: string,
                user_relationships_following_id: string,
                user_relationships_created_at: number,
                user_relationships_updated_at: number,
                user_relationships_deleted_at: number
            }[] | void = await this._userRelationshipRepository.get(false, userCognitoSub)
                .catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: { userCognitoSub }
                    });

                    return reject(Error.DATABASE_ERROR.GET);
                });

            return resolve(followers || []);
        });
    }

    /**
     * Gets user followings.
     * @param userCognitoSub: string
     * @returns Promise<{
     * user_relationships_id: number,
     * user_relationships_user_id: string,
     * user_relationships_following_id: string,
     * user_relationships_created_at: number,
     * user_relationships_updated_at: number,
     * user_relationships_deleted_at: number
     * }[]>
     */
    getFollowings(userCognitoSub: string): Promise<{
        user_relationships_id: number,
        user_relationships_user_id: string,
        user_relationships_following_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
    }[]> {

        return new Promise(async (resolve, reject) => {
            const followers: {
                user_relationships_id: number,
                user_relationships_user_id: string,
                user_relationships_following_id: string,
                user_relationships_created_at: number,
                user_relationships_updated_at: number,
                user_relationships_deleted_at: number
            }[] | void = await this._userRelationshipRepository.get(true, userCognitoSub)
                .catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: { userCognitoSub }
                    });

                    return reject(Error.DATABASE_ERROR.GET);
                });

            return resolve(followers || []);
        });
    }
}

export default UserAccountFacade;