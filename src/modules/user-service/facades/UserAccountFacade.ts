import IAwsCognito from '../infras/aws/IAwsCognito';
import IAwsS3 from '../infras/aws/IAwsS3';
import IUserRelationshipRepository from "../infras/repositories/IUserRelationshipRepository";
import IUserProfileRepository from "../infras/repositories/IUserProfileRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import {ListUsersResponse} from "aws-sdk/clients/cognitoidentityserviceprovider";
import {QueryFailedError} from "typeorm";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import moment from "moment";
import type { userProfileType } from '../../types';

class UserAccountFacade {
    private _log;

    constructor(
        private _awsCognito: IAwsCognito,
        private _awsS3: IAwsS3,
        private _userRelationshipRepository: IUserRelationshipRepository,
        private _userProfileRepository: IUserProfileRepository,
    ) {
        this._log = Logger.createLogger('UserAccountFacade.ts');
    }

    /**
     * Gets user information from AWS Cognito using access token.
     * @param accessToken: string
     * @returns Promise<{
     *         message: string,
     *         data: UserProfiles,
     *         code: number
     *     }>
     */
    getUserProfile(userId: string): Promise<{
        message: string,
        data: userProfileType,
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const userProfileData = await this._userProfileRepository.getUserProfileByUserId(userId).catch((error: QueryFailedError | string) => {
                if (String(error) === 'NOT_FOUND') {
                    return reject({
                        message: 'User not found',
                        code: 404
                    });
                }

                this._log.error({
                    function: 'getUserProfile()',
                    message: error.toString(),
                    payload: userId
                });
                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (userProfileData) {
                const newUserProfileData = {
                    id: (userProfileData.id)? userProfileData.id : 0,
                    userId: (userProfileData.user_id)? userProfileData.user_id : '',
                    email: (userProfileData.email)? userProfileData.email : '',
                    name: (userProfileData.name)? userProfileData.name : '',
                    avatar: (userProfileData.avatar)? userProfileData.avatar : '',
                    gender: (userProfileData.gender)? userProfileData.gender : '',
                    profileTitle: (userProfileData.profile_title)? userProfileData.profile_title : '',
                    profileDescription: (userProfileData.profile_description)? userProfileData.profile_description : '',
                    dateOfBirth: (userProfileData.date_of_birth)? userProfileData.date_of_birth : '',
                    website: (userProfileData.website)? userProfileData.website : '',
                    city: (userProfileData.city)? userProfileData.city : '',
                    state: (userProfileData.state)? userProfileData.state : '',
                    zipcode: (userProfileData.zipcode)? userProfileData.zipcode : '',
                    country: (userProfileData.country)? userProfileData.country : '',
                    phoneNumber: (userProfileData.phone_number)? userProfileData.phone_number : '',
                    isPublic: (userProfileData.is_public)? userProfileData.is_public : false,
                    createdAt: (userProfileData.created_at)? userProfileData.created_at : 0,
                    updatedAt: (userProfileData.updated_at)? userProfileData.updated_at : 0
                }

                return resolve({
                    message: 'User profile successfully retrieved',
                    data: newUserProfileData,
                    code: 200
                });

            }
        });
    }

    /**
     * Updates user's privacy settings
     * @param userCognitoSub: string
     * @param isPublic: boolean
     * @returns Promise<{
     *  message: string,
     *  data: {},
     *  code: number
     *  }>
     */
    updatePrivacyStatus(userCognitoSub: string, isPublic: boolean): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            await this._userProfileRepository.updatePrivacyStatus(userCognitoSub, isPublic)
                .catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'updatePrivacyStatus()',
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: { userCognitoSub }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                return resolve({
                    message: 'User privacy settings updated',
                    data: {},
                    code: 200
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
                    code: 200
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
                });
            });

            return resolve({
                message: `${followerCognitoSub} successfully unfollowed ${followeeCognitoSub}`,
                data: {},
                code: 200
            });
        });
    }

    /**
     * Upload profile avatar to S3 and update the user profile avatar in the database record.
     * @param userId: string
     * @param originalName: string
     * @param mimeType: string
     * @param data: Buffer
     * @returns Promise<{
     *     message: string,
     *     data: SendData,
     *     code: number
     * }>
     */
    uploadProfileAvatar(userId: string, originalName: string, mimeType: string, data: Buffer): Promise<{
        message: string,
        data: SendData,
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const unixTimeNow = moment().unix();
            const params = {
                Bucket: `${process.env.AWS_S3_BUCKET}`,
                Key: `avatars/${unixTimeNow}_${originalName}`,
                ContentType: mimeType,
                Body: data,
                ACL: 'public-read'
            }

            const s3Upload = await this._awsS3.upload(params).promise().catch((error: Error) => {
                this._log.error({
                    function: 'uploadProfileAvatar()',
                    message: error.message,
                    payload: {
                        originalName,
                        mimeType,
                        data
                    }
                });

                return reject({
                    message: Error.AWS_S3_ERROR,
                    code: 500
                });
            });

            if (s3Upload) {
                await this._userProfileRepository.updateUserAvatar(userId, s3Upload.Location).catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'uploadProfileAvatar()',
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: {
                            userId,
                            originalName,
                            mimeType,
                            data
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.UPDATE,
                        code: 500
                    });
                });

                return resolve({
                    message: 'profile avatar was successfully uploaded.',
                    data: s3Upload,
                    code: 200
                });
            }
        });
    }

    /**
     * Update name in AWS Cognito
     * @param userAttributeList: { Name: string; Value: any; }[]
     * @param userId: string
     * @returns Promise<{
     *     message: string,
     *     data: {},
     *     code: number
     * }>
     */
    updateNameInCognito(userAttributeList: { Name: string; Value: any; }[], userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const params = {
                Username: userId,
                UserAttributes: userAttributeList,
                UserPoolId: `${process.env.AWS_COGNITO_POOL_ID}`
            }

            await this._awsCognito.getAwsCognitoClient().adminUpdateUserAttributes(params).promise().catch((error: Error) => {
                this._log.error({
                    function: 'updateNameInCognito()',
                    message: error.message,
                    payload: {}
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            })

            return resolve({
                message: 'User attribute updated successfully.',
                data: {},
                code: 200
            });
        })
    }

    /**
     * Updates a user profile.
     * @params attributes: {},
     * @params userId: string,
     * @returns Promise<{
     *  message: string,
     *  data: {},
     *  code: number
     * }>
     */
    updateProfile(attributes: any = {}, userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const newAttributesList: any = {}

            // change the case to match the case of the database fields
            if (attributes.name) newAttributesList.name =  attributes.name;
            if (attributes.gender) newAttributesList.gender =  attributes.gender;
            if (attributes.profileTitle) newAttributesList.profile_title =  attributes.profileTitle;
            if (attributes.profileDescription) newAttributesList.profile_description =  attributes.profileDescription;
            if (attributes.dateOfBirth) newAttributesList.date_of_birth =  attributes.dateOfBirth;
            if (attributes.website) newAttributesList.website =  attributes.website;
            if (attributes.city) newAttributesList.city =  attributes.city;
            if (attributes.state) newAttributesList.state =  attributes.state;
            if (attributes.zipcode) newAttributesList.zipcode =  attributes.zipcode;
            if (attributes.country) newAttributesList.country =  attributes.country;
            if (attributes.phoneNumber) newAttributesList.phone_number =  attributes.phoneNumber;

            await this._userProfileRepository.updateUserProfile(newAttributesList, userId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateProfile()',
                    message: error.message,
                    payload: {}
                });

                return reject({
                    message: error.message,
                    code: 500
                });
            })

            return resolve({
                message: 'Profile updated successfully.',
                data: {},
                code: 200
            });
        })
    }
}

export default UserAccountFacade;