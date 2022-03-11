import IAwsCognito from '../infras/aws/IAwsCognito';
import IUserRelationshipRepository from "../infras/repositories/IUserRelationshipRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import {GetUserResponse, ListUsersResponse} from "aws-sdk/clients/cognitoidentityserviceprovider";
import {QueryFailedError} from "typeorm";

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
                        function: 'getUser()',
                        message: error.toString(),
                        payload: { sub }
                    });

                    return reject({
                        message: Error.AWS_COGNITO_ERROR,
                        code: 500
                    });
                } else {
                    if (!result.Users || result.Users.length < 1) {
                        this._log.warn({
                            function: 'getUser()',
                            message: 'Users not found.',
                            payload: { sub }
                        });
                        return reject({
                            message: `User: ${sub} not found.`,
                            code: 404
                        });
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
                            name: '',
                            email: '',
                            email_verified: false,
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

                        // Remove unnecessary object property in user data.
                        const { email_verified, ...newUserData } = user;

                        return resolve(newUserData);
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
     *             user_relationships_followee_id: string,
     *             user_relationships_follower_id: string,
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
            id: number,
            followeeId: string,
            followerId: string,
            createdAt: Date,
            updatedAt: Date,
            deletedAt: Date
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
     *             id: number,
     *             followeeId: string,
     *             followerId: string,
     *             createdAt: number,
     *             updatedAt: number,
     *             deletedAt: number
     *         }[],
     *         code: number
     *     }>
     */
    getFollowings(userCognitoSub: string): Promise<{
        message: string,
        data: {
            id: number,
            followeeId: string,
            followerId: string,
            createdAt: Date,
            updatedAt: Date,
            deletedAt: Date
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


    /**
     * To follow a user.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    followUser(followeeCognitoSub: string, followerCognitoSub: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            if (followeeCognitoSub === followerCognitoSub) {
                return reject({
                    message: 'Users are not allowed to follow themselves.',
                    code: 400
                });
            }

            // We retrieve the existence of user relationship based on the provided followeeCognitoSub and followerCognitoSub
            // to be able to skip the follow process if a specific record is already existing.
            const userRelationships = await this._userRelationshipRepository.getByFolloweeIdAndFollowerId(followeeCognitoSub, followerCognitoSub)
                .catch((error: string) => {
                    this._log.error({
                        function: 'followUser()',
                        message: error.toString(),
                        payload: {
                            followeeCognitoSub,
                            followerCognitoSub
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

            if (Array.isArray(userRelationships) && userRelationships.length <= 0) {
                // If the restoration of soft delete cannot be applied, we create a new user relationship record.
                const restoreSoftDelete = await this._userRelationshipRepository.restoreSoftDelete(followeeCognitoSub, followerCognitoSub);

                if (!restoreSoftDelete) {
                    await this._userRelationshipRepository.create(followeeCognitoSub, followerCognitoSub)
                        .save()
                        .catch((error: QueryFailedError) => {
                            this._log.error({
                                function: 'followUserById()',
                                message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                                payload: {
                                    followeeCognitoSub,
                                    followerCognitoSub
                                }
                            });

                            return reject({
                                message: Error.DATABASE_ERROR.CREATE,
                                code: 500
                            });
                        });
                }

                return resolve({
                    message: `${followeeCognitoSub} successfully followed by ${followerCognitoSub}`,
                    data: {},
                    code: 201
                });
            } else {
                return reject({
                    message: `This user was already been followed.`,
                    code: 409
                });
            }
        });
    }


    /**
     * To unfollow a user.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    unfollowUser(followeeCognitoSub: string, followerCognitoSub: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            await this._userRelationshipRepository.softDelete(followeeCognitoSub, followerCognitoSub).catch((error: string) => {
                this._log.error({
                    function: 'unfollowUser()',
                    message: error,
                    payload: {
                        followeeCognitoSub,
                        followerCognitoSub
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.DELETE,
                    code: 500
                })
            });

            return resolve({
                message: `${followerCognitoSub} successfully unfollowed ${followeeCognitoSub}`,
                data: {},
                code: 204
            });
        });
    }
}

export default UserAccountFacade;