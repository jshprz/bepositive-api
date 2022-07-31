import IAwsCognito from "../../infras/aws/IAwsCognito";
import IAwsS3 from "../../infras/aws/IAwsS3";
import IUserRelationshipRepository from "../../infras/repositories/IUserRelationshipRepository";
import IUserProfileRepository from "../../infras/repositories/IUserProfileRepository";
import Logger from "../../config/Logger";
import type {userProfileType, userRelationshipTypes} from "./types";
import { QueryFailedError } from "typeorm";
import Error from "../../config/Error";
import {AttributeType, ListUsersResponse} from "aws-sdk/clients/cognitoidentityserviceprovider";
import moment from "moment";
import { ManagedUpload } from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import IUserAccount from "./IUserAccount";
import { ISignUpResult } from "amazon-cognito-identity-js";

class UserAccount implements IUserAccount {

    private _log;

    constructor(
        private _awsCognito: IAwsCognito,
        private _awsS3: IAwsS3,
        private _userRelationshipRepository: IUserRelationshipRepository,
        private _userProfileRepository: IUserProfileRepository,
    ) {
        this._log = Logger.createLogger('UserAccount.ts');
    }

    /**
     * Gets user information from AWS Cognito using access token.
     * @param userId: string
     * @param loggedInUserId: string
     * @returns Promise<{
     *         message: string,
     *         data: UserProfiles,
     *         code: number
     *     }>
     */
    getUserProfile(userId: string, loggedInUserId: string): Promise<{
        message: string,
        data: userProfileType,
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const userProfileData: void | userProfileType  = await this._userProfileRepository.getUserProfileByUserId(userId).catch((error: QueryFailedError | string) => {
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
                const userFollowing: void | userRelationshipTypes[] = await this._userRelationshipRepository.getByFolloweeIdAndFollowerId(userId, loggedInUserId).catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'getUserProfile()',
                        message: error.toString(),
                        payload: {
                            userId,
                            loggedInUserId
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                // To set the isFollowed status - if the logged-in user has followed the another user or not.
                if (Array.isArray(userFollowing) && userFollowing.length > 0) {
                    userProfileData.isFollowed = true;
                }

                return resolve({
                    message: 'User profile successfully retrieved',
                    data: userProfileData,
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
        phone_number: string,
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
                            phone_number: '',
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
     *             id: string,
     *             followeeId: string,
     *             followerId: string,
     *             createdAt: Date,
     *             updatedAt: Date,
     *             deletedAt: Date
     *         }[],
     *         code: number
     *     }>
     */
    getFollowers(userCognitoSub: string): Promise<{
        message: string,
        data: {
            id: string,
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
     *             id: string,
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
            id: string,
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
                        function: 'getFollowings()',
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
                                function: 'followUser()',
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
                    payload: {
                        userAttributeList,
                        userId
                    }
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

    /**
     * User registration through AWS Cognito.
     * @param body: { email: string, verifyCode: string }
     * @returns Promise<{
     *         message: string,
     *         data: ISignUpResult,
     *         code: number
     *     }>
     */
    register(body: { username: string; email: string; phoneNumber: string; name: string; password: string; }): Promise<{
        message: string,
        data: ISignUpResult,
        code: number
    }> {
        return new Promise((resolve, reject) => {
            const cognitoAttributeList = this._awsCognito.cognitoUserAttributeList(body.email, body.phoneNumber, body.name);

            this._awsCognito.userPool().signUp(body.username, body.password, cognitoAttributeList, [], async (error: any, result?: ISignUpResult) => {

                if (error) {
                    this._log.error({
                        function: 'register()',
                        message: error,
                        payload: body
                    });

                    if (error.code && error.code === 'UsernameExistsException') {
                        return reject({
                            message: error,
                            code: 409
                        });
                    }

                    return reject({
                        message: Error.AWS_COGNITO_ERROR,
                        code: 500
                    });
                }

                if (result) {
                    return resolve({
                        message: `User successfully registered. The verification code has been sent to this email: ${body.email}`,
                        data: result,
                        code: 200
                    });
                } else {
                    return reject({
                        message: `AWS Cognito register result is empty: ${result}`,
                        code: 500
                    });
                }
            });
        });
    }

    /**
     * Verifies user registration through a verification code from the user's email.
     * @param body { email: string, verifyCode: string }
     * @returns Promise<string>
     */
    verifyUser(body: { email: string, verifyCode: string }): Promise<string> {
        return new Promise(async (resolve, reject) => {
            this._awsCognito.getCognitoUser(body.email).confirmRegistration(body.verifyCode, false, (error: any, result: string) => {
                if (error) {
                    this._log.error({
                        function: 'verifyUser()',
                        message: error,
                        payload: body
                    });

                    if (error.code && (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException')) {
                        return reject(error);
                    }

                    return reject(Error.AWS_COGNITO_ERROR);
                }

                return resolve(result);
            });
        });
    }

    /**
     * Updates email_verified attribute to true within the AWS Cognito user pool.
     * @param email: string
     * @returns Promise<boolean>
     */
    updateEmailVerifiedToTrue(email: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._awsCognito.getAwsCognitoClient().adminUpdateUserAttributes({
                UserAttributes: [{
                    Name: 'email_verified',
                    Value: 'true'
                }
                    // other user attributes like phone_number or email themselves, etc
                ],
                UserPoolId: String(process.env.AWS_COGNITO_POOL_ID),
                Username: email
            }, (error: Error) => {
                if (error) {
                    this._log.error({
                        function: 'updateEmailVerifiedToTrue()',
                        message: error.toString(),
                        payload: { email }
                    });

                    return reject(Error.AWS_COGNITO_ERROR);
                } else {
                    return resolve(true);
                }
            });
        });
    }

    /**
     * Resends account confirmation code via provided email.
     * @param email: string
     * @returns Promise<boolean>
     */
    resendAccountConfirmationCode(email: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._awsCognito.getAwsCognitoClient().resendConfirmationCode({
                ClientId: String(process.env.AWS_COGNITO_APP_CLIENT_ID),
                Username: email
            }, (error?: Error) => {
                if (error) {
                    this._log.error({
                        function: 'resendAccountConfirmationCode()',
                        message: error.toString(),
                        payload: {email}
                    });
                    return reject(error);
                } else {
                    return resolve(true);
                }
            });
        });
    }

    /**
     * To create user profile data in user_profiles table.
     * @param item: {userId: string, email: string, name: string}
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    createUserProfileData(item: {userId: string, username: string, email: string, phoneNumber: string, name: string}): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const getUserProfileByEmailResult = await this._userProfileRepository.getUserProfileByEmail(item.email).catch((error: string) => {
                this._log.error({
                    function: 'createUserProfileData()',
                    message: error,
                    payload: {
                        item
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                })
            });

            // If a user profile is already existing in the record we create it.
            if (getUserProfileByEmailResult && getUserProfileByEmailResult.id === '') {
                await this._userProfileRepository.create(item).catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'createUserProfileData()',
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: {
                            item
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.CREATE,
                        code: 500
                    });
                });
            }

            return resolve({
                message: 'user profile data was created successfully',
                data: {},
                code: 200
            });
        });
    }

    /**
     * To send verification code to logged in user's phone number.
     * @param accessToken: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    sendPhoneNumberVerification(accessToken: string, phoneNumber: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {

            const getUserResult = await this._awsCognito.getAwsCognitoClient().adminGetUser({
                Username: phoneNumber,
                UserPoolId: String(process.env.AWS_COGNITO_POOL_ID)
            }).promise().catch((error) => {
                if (error?.code !== 'UserNotFoundException') {
                    this._log.error({
                        function: 'sendPhoneNumberVerification()',
                        message: error,
                        payload: {
                            accessToken,
                            phoneNumber
                        }
                    });

                    return reject({
                        message: Error.AWS_COGNITO_ERROR,
                        code: 500
                    });
                }
            });

            let phoneNumberToBeCompared: string = '';
            let isPhoneNumberVerified: boolean = false;

            if (getUserResult) {
                getUserResult.UserAttributes?.forEach((userAttribute) => {
                    if (userAttribute.Name === 'phone_number') {
                        phoneNumberToBeCompared = userAttribute.Value || '';
                    }

                    if (userAttribute.Name === 'phone_number_verified') {
                        isPhoneNumberVerified = (userAttribute.Value === 'true')? true : false;
                    }
                });
            }

            if (phoneNumber === phoneNumberToBeCompared && isPhoneNumberVerified) {
                return reject({
                    message: 'The phone number was successfully verified by the another user. Please update your account phone number to the right one.',
                    code: 409
                })
            }

            this._awsCognito.getAwsCognitoClient().getUserAttributeVerificationCode({
                AccessToken: accessToken,
                AttributeName: 'phone_number'
            }, (error, data) => {

                if (error) {
                    this._log.error({
                        function: 'sendPhoneNumberVerification()',
                        message: error.message,
                        payload: {
                            accessToken
                        }
                    });

                    return reject({
                        message: Error.AWS_COGNITO_ERROR,
                        code: 500
                    });
                } else {
                    return resolve({
                        message: 'Verification code has been sent.',
                        data: {},
                        code: 200
                    });
                }
            });
        });
    }

    /**
     * To verify phone number through verification code.
     * @param accessToken: string
     * @param verifyCode: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    verifyPhoneNumber(accessToken: string, verifyCode: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise((resolve, reject) => {

            this._awsCognito.getAwsCognitoClient().verifyUserAttribute({
                AccessToken: accessToken,
                AttributeName: 'phone_number',
                Code: verifyCode
            }, (error, data) => {

                if (error) {
                    this._log.error({
                        function: 'verifyPhoneNumber()',
                        message: error.message,
                        payload: {
                            accessToken
                        }
                    });

                    return reject({
                        message: Error.AWS_COGNITO_ERROR,
                        code: 500
                    });
                } else {
                    return resolve({
                        message: 'Phone number was successfully verified.',
                        data: {},
                        code: 200
                    });
                }
            });
        });
    }

    /**
     * Get user profile by email.
     * @param email: string
     * @returns Promise<{
     *         message: string,
     *         data: userProfileType,
     *         code: number
     *     }>
     */
    getUserProfileByEmail(email: string): Promise<{
        message: string,
        data: userProfileType,
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const getUserProfileByEmailResult = await this._userProfileRepository.getUserProfileByEmail(email).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createUserProfileData()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        email
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                });
            });

            if (getUserProfileByEmailResult && getUserProfileByEmailResult.id) {
                return resolve({
                    message: 'User profile was successfully retrieved',
                    data: getUserProfileByEmailResult,
                    code: 200
                });
            }

            return reject({
                message: 'User profile not found',
                code: 404
            });
        });
    }


    /**
     * Get account verification status.
     * @param accessToken: string
     * @returns Promise<{
     *         message: string,
     *         data: {
     *             isEmailVerified: boolean,
     *             isPhoneNumberVerified: boolean
     *         },
     *         code: number
     *     }>
     */
    getAccountVerificationStatus(accessToken: string): Promise<{
        message: string,
        data: {
            isEmailVerified: boolean,
            isPhoneNumberVerified: boolean
        },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {

            const getUserResult = await this._awsCognito.getAwsCognitoClient().getUser({
                AccessToken: accessToken
            }).promise().catch((error) => {
                this._log.error({
                    function: 'getAccountVerificationStatus()',
                    message: error,
                    payload: {
                        accessToken
                    }
                });

                return reject({
                    message: Error.AWS_COGNITO_ERROR,
                    code: 500
                });
            });

            const verificationStatuses = {
                isEmailVerified: false,
                isPhoneNumberVerified: false
            };

            if (getUserResult) {
                getUserResult.UserAttributes.forEach((attribute) => {
                    if (attribute.Name === 'email_verified') {
                        verificationStatuses.isEmailVerified = (attribute.Value === 'true')? true : false;
                    }

                    if (attribute.Name === 'phone_number_verified') {
                        verificationStatuses.isPhoneNumberVerified = (attribute.Value === 'true')? true : false;
                    }
                });
            }

            return resolve({
                message: 'Account verification status was successfully retrieved.',
                data: verificationStatuses,
                code: 200
            })
        });
    }
}

export default UserAccount;