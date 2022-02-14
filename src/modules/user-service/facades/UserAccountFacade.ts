import IAwsCognito from '../infras/aws/IAwsCognito';
import IUserRelationshipRepository from "../infras/repositories/IUserRelationshipRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import {GetUserResponse, ListUsersResponse} from "aws-sdk/clients/cognitoidentityserviceprovider";

class UserAccountFacade {
    private _log;

    constructor(private _awsCognito: IAwsCognito, private _userRelationshipRepository: IUserRelationshipRepository) {
        this._log = Logger.createLogger('UserAccountFacade.ts');
    }

    /**
     * Gets user information from AWS Cognito using access token
     * @param accessToken: string
     * @returns Promise<{Username: string, UserAttributes: {}[]}>
     */
    getUserProfile(accessToken: string): Promise<{Username: string, UserAttributes: {}[]}> {

        return new Promise(async (resolve, reject) => {
            const params = { AccessToken: accessToken};
            this._awsCognito.getAwsCognitoClient().getUser(params, (error: Error, result: GetUserResponse) => {
                if (error) {
                    this._log.error({
                        message: error.toString(),
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
            const params = { Filter: `sub = "${sub}"`, UserPoolId: String(process.env.AWS_COGNITO_POOL_ID) }

            this._awsCognito.getAwsCognitoClient().listUsers(params, (error:Error, result: ListUsersResponse) => {

                if (error) {
                    this._log.error({
                        message: error.toString(),
                        payload: {"sub": sub}
                    });

                    return reject(Error.AWS_COGNITO_ERROR);
                } else {
                    if (!result.Users) {
                        return reject(Error.AWS_COGNITO_ERROR);
                    } else {
                        const rawUser = result.Users.map((user) => {
                            return {
                                Username: String(user.Username),
                                Attributes: user.Attributes,
                                UserCreateDate: new Date(String(user.UserCreateDate)),
                                UserLastModifiedDate: new Date(String(user.UserLastModifiedDate)),
                                Enabled: Boolean(user.Enabled),
                                UserStatus: String(user.UserStatus)
                            }
                        });
                        const user = {
                            username: '',
                            sub: '',
                            email_verified: '',
                            name: '',
                            email: '',
                            dateCreated: new Date(),
                            dateModified: new Date(),
                            enabled: false,
                            status: ''
                        };

                        user.username = rawUser[0].Username;
                        if (rawUser[0].Attributes) {
                            rawUser[0].Attributes.forEach(attr => {
                                // @ts-ignore
                                user[attr.Name] = attr.Value;
                            });
                        }
                        user.dateCreated = rawUser[0].UserCreateDate;
                        user.dateModified = rawUser[0].UserLastModifiedDate;
                        user.enabled = rawUser[0].Enabled;
                        user.status = rawUser[0].UserStatus;

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
     *         message: string,
     *         data: {
     *             user_relationships_id: number,
     *             user_relationships_user_id: string,
     *             user_relationships_following_id: string,
     *             user_relationships_created_at: number,
     *             user_relationships_updated_at: number,
     *             user_relationships_deleted_at: number
     *         }[],
     *         code: number
     *     }>
     */
    getFollowers(userCognitoSub: string): Promise<{
        message: string,
        data: {
            user_relationships_id: number,
            user_relationships_user_id: string,
            user_relationships_following_id: string,
            user_relationships_created_at: number,
            user_relationships_updated_at: number,
            user_relationships_deleted_at: number
        }[],
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const followers = await this._userRelationshipRepository.get(false, userCognitoSub)
                .catch((error) => {
                    this._log.error({
                        function: 'getFollowers()',
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: { userCognitoSub }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

            // If the followers is not an array, it should be an error.
            if (Array.isArray(followers)) {
                return resolve({
                    message: 'Followers successfully retrieved',
                    data: followers,
                    code: 200
                });
            } else {
                this._log.error({
                    function: 'getFollowers()',
                    message: `An error occurred while retrieving the followers: ${followers}`,
                    payload: {userCognitoSub}
                });

                return reject({
                    message: 'An error occurred while retrieving the followers',
                    code: 500
                });
            }
        });
    }

    /**
     * Gets user followings.
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: {
     *             user_relationships_id: number,
     *             user_relationships_user_id: string,
     *             user_relationships_following_id: string,
     *             user_relationships_created_at: number,
     *             user_relationships_updated_at: number,
     *             user_relationships_deleted_at: number
     *         }[],
     *         code: number
     *     }>
     */
    getFollowings(userCognitoSub: string): Promise<{
        message: string,
        data: {
            user_relationships_id: number,
            user_relationships_user_id: string,
            user_relationships_following_id: string,
            user_relationships_created_at: number,
            user_relationships_updated_at: number,
            user_relationships_deleted_at: number
        }[],
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const followings = await this._userRelationshipRepository.get(true, userCognitoSub)
                .catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {userCognitoSub}
                    });

                    return reject(Error.DATABASE_ERROR.GET);
                });

            // If the followings is not an array, it should be an error.
            if (Array.isArray(followings)) {
                return resolve({
                    message: 'Followings successfully retrieved',
                    data: followings,
                    code: 200
                });
            } else {
                this._log.error({
                    function: 'getFollowings()',
                    message: `An error occurred while retrieving the followers: ${followings}`,
                    payload: {userCognitoSub}
                });

                return reject({
                    message: 'An error occurred while retrieving the followings',
                    code: 500
                });
            }
        });
    }
}

export default UserAccountFacade;