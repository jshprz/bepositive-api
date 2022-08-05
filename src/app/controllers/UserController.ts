import multer from "multer";
import mime from "mime";
import path from "path";

// Infras
import AwsCognito from "../../infras/aws/AwsCognito";
import AwsS3 from "../../infras/aws/AwsS3";
import AccessTokenRepository from "../../infras/repositories/AccessTokenRepository";
import UserRelationshipRepository from "../../infras/repositories/UserRelationshipRepository";
import UserProfileRepository from "../../infras/repositories/UserProfileRepository";

// User Modules
import Authentication from "../../modules/user-service/Authentication";
import Password from "../../modules/user-service/Password";
import UserAccount from "../../modules/user-service/UserAccount";

import { Request, Response } from 'express';
import { validationResult } from "express-validator";

// Declaration merging on aws-cognito-identity-js
import '../../declarations/DAwsCognito'
import { timestampsType } from "../../modules/types";

import ResponseMutator from "../../utils/ResponseMutator";
import jwtDecode from "jwt-decode";
import moment from "moment";

type validateFileMimeTypeType = {
    isFailed: boolean,
    message: string | null
}

class UserController {

    private _authentication;
    private _password;
    private _userAccount;
    private _upload;
    private _utilResponseMutator;

    constructor() {
        this._authentication = new Authentication(new AwsCognito(), new AccessTokenRepository());
        this._password = new Password(new AwsCognito());
        this._userAccount = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
        this._upload = multer().single('avatarFile');
        this._utilResponseMutator = new ResponseMutator();
    }

    async normalLogin(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.user) {
            return res.status(400).json({
                message: errors.user.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.password) {
            return res.status(400).json({
                message: errors.password.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const fieldName = this.getUsernameAlias(req.body.user);
            const getUserprofileBy = await this._userAccount.getUserProfileBy(req.body.user, fieldName);

            const userCredentials = {
                user: getUserprofileBy.data.username,
                password: req.body.password
            }

            const signin = await this._authentication.normalLogin(userCredentials);

            const accessToken: string = signin.accessToken.jwtToken;
            const refreshToken: string = signin.refreshToken.token;
            const accessTokenExpiration: number = signin.accessToken.payload.exp;
            const userCognitoSub: string = signin.idToken.payload.sub;

            const getAccountVerificationStatusResult = await this._userAccount.getAccountVerificationStatus(accessToken);

            // If the user tries to sign in with their phone number, we check whether the phone number is verified or not.
            // We don't let them use their phone number if it isn't verified yet.
            if (fieldName === 'phone_number' && !getAccountVerificationStatusResult.data.isPhoneNumberVerified) {
                return res.status(403).json({
                    message: 'User is not confirmed.',
                    error: 'Forbidden',
                    status: 403
                });
            }

            // Creates accessToken record within the access_tokens table.
            await this._authentication.createAccessTokenItem(accessToken, userCognitoSub);

            return res.status(200).json({
                message: 'Successfully logged in',
                payload: {
                    accessToken,
                    refreshToken,
                    accessTokenExpiration
                },
                status: 200
            });
        } catch (error: any) {

            const response = {
                message: '',
                error: '',
                status: 500
            }

            if (error.code && (error.code === 'NotAuthorizedException' || error.code === 401 || error.code === 404)) {

                response.message = (error.code === 404)? 'Incorrect username or password.' : error.message;
                response.error = 'Unauthorized';
                response.status = 401;

            } else if (error.code && (error.code === 'UserNotConfirmedException' || error.code === 403)) {

                response.message = error.message;
                response.error = 'Forbidden';
                response.status = 403;

            } else {

                response.message = error.message;
                response.error = 'Internal server error';
                response.status = 500;

            }

            return res.status(response.status).json({
                message: response.message.toString(),
                error: response.error,
                status: response.status
            });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const userCognitoSub: string = req.body.userCognitoSub;

            await this._authentication.logout(req);
            await this._authentication.deleteAccessTokenItem(userCognitoSub);

            return res.status(200).json({
                message: 'User successfully logged out',
                payload: {},
                status: 200
            });
        } catch (error) {
            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { email } = req.body;
            await this._password.forgotPassword(email);

            return res.status(200).json({
                message: `Reset password token successfully sent to this email: ${email}`,
                payload: {},
                status: 200
            });
        } catch (error) {
            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.verifyCode) {
            return res.status(400).json({
                message: errors.verifyCode.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.newPassword) {
            return res.status(400).json({
                message: errors.newPassword.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            await this._password.resetPassword(req.body);

            return res.status(200).json({
                message: 'Password reset successfully',
                payload: {},
                status: 200
            });
        } catch (error: any) {

            const response = {
                message: '',
                error: '',
                status: 500
            }

            if (error.code && error.code === 'CodeMismatchException') {

                response.message = error.message;
                response.error = 'CodeMismatchException';
                response.status = 409;

            } else if (error.code && error.code === 'ExpiredCodeException') {

                response.message = 'Verification code has already been expired.';
                response.error = 'ExpiredCodeException';
                response.status = 410;

            } else {

                response.message = error;
                response.error = 'Internal server error';
                response.status = 500;

            }

            return res.status(response.status).json({
                message: response.message.toString(),
                error: response.error,
                status: response.status
            });
        }
    }

    async register(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.username) {
            return res.status(400).json({
                message: errors.username.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.phoneNumber) {
            return res.status(400).json({
                message: errors.phoneNumber.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.name) {
            return res.status(400).json({
                message: errors.name.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.password) {
            return res.status(400).json({
                message: errors.password.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { username, email, phoneNumber, name, password } = req.body;

            const registerResult = await this._userAccount.register({
                username,
                email,
                phoneNumber,
                name,
                password
            });
            // We create user profile data in user_profiles table every user registration
            // so that we don't need to rely on AWS Cognito when we need to retrieve a user profile data.
            const createUserProfileData = await this._userAccount.createUserProfileData({
                userId: registerResult.data.userSub,
                username,
                email,
                phoneNumber,
                name
            });

            return res.status(createUserProfileData.code).json({
                message: createUserProfileData.message,
                payload: createUserProfileData.data,
                status: createUserProfileData.code
            });
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(409).json({
                    message: error.message.message,
                    error: 'Conflict',
                    status: 409
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async verify(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.verifyCode) {
            return res.status(400).json({
                message: errors.verifyCode.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { email } = req.body;
            const userProfile = await this._userAccount.getUserProfileBy(email, 'email');
            req.body.email = userProfile.data.username;
            await this._userAccount.verifyUser(req.body);
            await this._userAccount.updateEmailVerifiedToTrue(email);

            return res.status(200).json({
                message: 'Verified successfully.',
                payload: {},
                status: 200
            });
        } catch (error: any) {

            const response = {
                message: '',
                error: '',
                status: 500
            }

            if (error.code && error.code === 404) {

                response.message = error.message;
                response.error = 'Not Found';
                response.status = 404;

            } else if (error.code && error.code === 'CodeMismatchException') {

                response.message = error.message;
                response.error = 'CodeMismatchException';
                response.status = 409;

            } else if (error.code && error.code === 'ExpiredCodeException') {

                response.message = 'Verification code has already been expired.';
                response.error = 'ExpiredCodeException';
                response.status = 410;

            } else {

                response.message = error;
                response.error = 'Internal server error';
                response.status = 500;

            }

            return res.status(response.status).json({
                message: response.message.toString(),
                error: response.error,
                status: response.status
            });
        }
    }

    async resendAccountConfirmationCode(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            await this._userAccount.resendAccountConfirmationCode(req.body.email);

            return res.status(200).json({
                message: `The verification code has been re-sent to this email: ${req.body.email}`,
                payload: {},
                status: 200
            });
        } catch (error: any) {
            return res.status(500).json({
                message: error.toString(),
                error: 'Internal server error',
                status: 500
            });
        }
    }

    async getUserProfile(req: Request, res: Response) {
        try {
            // We'll first consider if a userId param is provided, which means that our intention is to retrieve the profile of another user.
            // Otherwise, the userCognitoSub of the currently logged-in user will be used for the query.
            const userId: string = req.params.userId || req.body.userCognitoSub;
            const userProfile = await this._userAccount.getUserProfile(userId, req.body.userCognitoSub);

            // Logged-in users can access their own profiles whether their privacy is set to public or not.
            // Logged-in users can only access other users' profiles that are set to public.
            if (userProfile.data.isPublic || userProfile.data.userId === req.body.userCognitoSub) {

                const userFollowers = await this._userAccount.getFollowers(userId);
                const userFollowings = await this._userAccount.getFollowings(userId);

                // Change the createdAt and updatedAt datetime format to unix timestamp
                // We do this as format convention for createdAt and updatedAt
                const timestamps = {
                    createdAt: userProfile.data.createdAt,
                    updatedAt: userProfile.data.updatedAt
                }

                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                userProfile.data.createdAt = unixTimestamps.createdAt;
                userProfile.data.updatedAt = unixTimestamps.updatedAt;

                return res.status(userProfile.code).json({
                    message: userProfile.message,
                    payload: {
                        profile: {
                            userId: userProfile.data.userId,
                            name: userProfile.data.name,
                            avatar: userProfile.data.avatar,
                            profileTitle: userProfile.data.profileTitle,
                            profileDescription: userProfile.data.profileDescription,
                            website: userProfile.data.website,
                            phoneNumber: userProfile.data.phoneNumber,
                            followers: userFollowers.data.length,
                            followings: userFollowings.data.length,
                            isFollowed: userProfile.data.isFollowed,
                            isPublic: userProfile.data.isPublic
                        }
                    },
                    status: userProfile.code
                });
            } else {
                return res.status(404).json({
                    message: `User profile is set to private.`,
                    error: 'Not Found',
                    status: 404
                });
            }
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async followUser(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.followeeCognitoSub) {
            return res.status(400).json({
                message: errors.followeeCognitoSub.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const followeeCognitoSub: string = req.params.followeeCognitoSub;
            const followerCognitoSub: string = req.body.userCognitoSub;

            // Check the existence of the followeeCognitoSub and followerCognitoSub first.
            for (const item of [followeeCognitoSub, followerCognitoSub]) {
                await this._userAccount.getUser(item);
            }

            const followUserResult = await this._userAccount.followUser(followeeCognitoSub, followerCognitoSub);

            return res.status(followUserResult.code).json({
                message: followUserResult.message,
                payload: followUserResult.data,
                status: followUserResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async unfollowUser(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.followeeCognitoSub) {
            return res.status(400).json({
                message: errors.followeeCognitoSub.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const followeeCognitoSub: string = req.params.followeeCognitoSub;
            const followerCognitoSub: string = req.body.userCognitoSub;

            // Check the existence of the followeeCognitoSub and followerCognitoSub first.
            for (const item of [followeeCognitoSub, followerCognitoSub]) {
                await this._userAccount.getUser(item);
            }

            const followUserResult = await this._userAccount.unfollowUser(followeeCognitoSub, followerCognitoSub);

            return res.status(followUserResult.code).json({
                message: followUserResult.message,
                payload: followUserResult.data,
                status: followUserResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async uploadProfileAvatar(req: Request, res: Response) {

        const userId: string = req.body.userCognitoSub;

        this._upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    message: 'A Multer error occurred when uploading',
                    error: 'Bad request error',
                    status: 400
                });
            } else if (error) {
                return res.status(520).json({
                    message: 'An unknown error occurred when uploading',
                    error: 'Unknown server error',
                    status: 520
                });
            } else {
                if (req.file) {
                    const fileExtension = path.extname(req.file.originalname);
                    const mimeType = req.file.mimetype;

                    if (this._validateFileMimeType(mimeType).isFailed) {
                        return res.status(400).json({
                            message: this._validateFileMimeType(mimeType).message,
                            error: 'Bad request error',
                            status: 400
                        });
                    }

                    // To check if the avatar filename extension is equal to the extension generated based on the mime type of the avatar file
                    // for recognizing whether the avatar extension is valid or not.
                    if (`.${this._validateFileMimeType(mimeType).message}` !== fileExtension && `${this._validateFileMimeType(mimeType).message}` !== 'jpeg') {
                        return res.status(400).json({
                            message: `invalid file extension: ${fileExtension} - ${this._validateFileMimeType(mimeType).message}`,
                            error: 'Bad request error',
                            status: 400
                        });
                    }

                    try {
                        if (req.file?.buffer) {
                            const uploadProfileAvatarResult = await this._userAccount.uploadProfileAvatar(userId, req.file.originalname, req.file.mimetype, req.file.buffer);

                            return res.status(uploadProfileAvatarResult.code).json({
                                message: uploadProfileAvatarResult.message,
                                payload: {
                                    location: uploadProfileAvatarResult.data.Location
                                },
                                status: uploadProfileAvatarResult.code
                            });
                        }
                    } catch (error: any) {
                        return res.status(500).json({
                            message: error.message,
                            error: 'Internal server error',
                            status: 500
                        });
                    }

                } else {
                    return res.status(400).json({
                        message: 'form-data key avatarFile is required',
                        error: 'Bad request error',
                        status: 400
                    });
                }
            }
        });
    }

    private _validateFileMimeType(mimeType: string): validateFileMimeTypeType {
        switch (mimeType) {
            case 'image/jpeg':
            case 'image/png':
                return {
                    isFailed: false,
                    message: mime.getExtension(mimeType)
                }
            case '':
            default:
                return {
                    isFailed: true,
                    message: 'unsupported file extension. This API only accepts (jpg/jpeg, png)'
                }
        }
    }

    async updatePrivacy(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.isPublic) {
            return res.status(400).json({
                message: errors.isPublic.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const userId: string = req.body.userCognitoSub;
            const isPublic: boolean = req.body.isPublic;

            const updatePrivacyResult = await this._userAccount.updatePrivacyStatus(userId, isPublic);

            return res.status(200).json({
                message: updatePrivacyResult.message,
                payload: updatePrivacyResult.data,
                status: 200
            });
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async refreshAccessToken(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.accessToken) {
            return res.status(400).json({
                message: errors.accessToken.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.refreshToken) {
            return res.status(400).json({
                message: errors.refreshToken.msg,
                error: 'Bad request error',
                status: 400
            });
        }
        try {
            const accessToken: string = req.body.accessToken;
            const refreshToken: string = req.body.refreshToken;
            const decodedAccessToken: { sub: string } = await jwtDecode(accessToken);
            const generateNewAccessTokenResult = await this._authentication.generateNewAccessToken(refreshToken);

            if (generateNewAccessTokenResult.data.AuthenticationResult && generateNewAccessTokenResult.data.AuthenticationResult.AccessToken) {
                const newAccessToken: string = generateNewAccessTokenResult.data.AuthenticationResult.AccessToken;
                const decodedNewAccessToken: { sub: string } = await jwtDecode(newAccessToken);

                if (decodedAccessToken.sub !== decodedNewAccessToken.sub) {
                    throw {
                        message: 'Mismatch AWS cognito sub in old and new access token',
                        code: 500
                    };
                }
                // Revoke the access token.
                await this._authentication.deleteAccessTokenItem(decodedAccessToken.sub);

                // We store the access token in our database, so we can manipulate it.
                await this._authentication.createAccessTokenItem(newAccessToken, decodedNewAccessToken.sub);

                const accessTokenExpiration: number = Number(moment().unix()) + Number(generateNewAccessTokenResult.data.AuthenticationResult.ExpiresIn);

                return res.status(200).json({
                    message: generateNewAccessTokenResult.message,
                    payload: {
                        accessToken: generateNewAccessTokenResult.data.AuthenticationResult.AccessToken,
                        accessTokenExpiration
                    },
                    status: 200
                });
            }

            throw {
                message: 'Missing new access token',
                code: 500
            }
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async updateProfile(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.attributes) {
            return res.status(400).json({
                message: errors.attributes.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors['attributes.name']) {
            return res.status(400).json({
                message: errors['attributes.name'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.gender']) {
            return res.status(400).json({
                message: errors['attributes.gender'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.profileTitle']) {
            return res.status(400).json({
                message: errors['attributes.profileTitle'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.profileDescription']) {
            return res.status(400).json({
                message: errors['attributes.profileDescription'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.dateOfBirth']) {
            return res.status(400).json({
                message: errors['attributes.dateOfBirth'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.website']) {
            return res.status(400).json({
                message: errors['attributes.website'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.city']) {
            return res.status(400).json({
                message: errors['attributes.city'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.state']) {
            return res.status(400).json({
                message: errors['attributes.state'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.zipcode']) {
            return res.status(400).json({
                message: errors['attributes.zipcode'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.country']) {
            return res.status(400).json({
                message: errors['attributes.country'].msg,
                error: 'Bad request error',
                status: 400
            });
        }
        if (errors['attributes.phoneNumber']) {
            return res.status(400).json({
                message: errors['attributes.phoneNumber'].msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { attributes } = req.body;
            const cognitoUpdate = [];
            const userCognitoSub: string = req.body.userCognitoSub;
            const userCognitoName: string = req.body.userCognitoName;

            // if changing the name , update it first in Cognito.
            if (attributes.name) {
                cognitoUpdate.push({
                    "Name": "name",
                    "Value": attributes.name
                });
            }

            if (attributes.phoneNumber) {
                cognitoUpdate.push({
                    "Name": "phone_number",
                    "Value": attributes.phoneNumber
                });
            }

            if (cognitoUpdate.length) {
                try {
                    await this._userAccount.updateNameInCognito(cognitoUpdate, userCognitoName);
                } catch (error: any) {
                    return res.status(520).json({
                        message: error.message,
                        error: 'Unknown Server error',
                        status: 520
                    });
                }
            }
            // continue with the update of the other fields
            if (attributes) {
                const updateProfileResult = await this._userAccount.updateProfile(attributes, userCognitoSub);

                return res.status(200).json({
                    message: updateProfileResult.message,
                    payload: updateProfileResult.data,
                    status: 200
                });
            } else {
                return res.status(400).json({
                    message: "No attributes provided.",
                    error: 'Bad Request',
                    status: 400
                });
            }
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async getUserFollowersProfiles(req: Request, res: Response) {
        try {
            const errors = validationResult(req).mapped();

            if (errors.userId) {
                return res.status(400).json({
                    message: errors.userId.msg,
                    error: 'Bad request error',
                    status: 400
                });
            }

            const userId: string = req.params.userId;
            const userFollowers = await this._userAccount.getFollowers(userId);

            const userFollowersProfiles: {
                userId: string,
                name: string,
                avatar: string,
                profileTitle: string,
                profileDescription: string,
                website: string,
                isFollowed: boolean
            }[] = [];

            for (const follower of userFollowers.data) {
                const userProfile = await this._userAccount.getUserProfile(follower.followerId, req.body.userCognitoSub);

                userFollowersProfiles.push({
                    userId: userProfile.data.userId,
                    name: userProfile.data.name,
                    avatar: userProfile.data.avatar,
                    profileTitle: userProfile.data.profileTitle,
                    profileDescription: userProfile.data.profileDescription,
                    website: userProfile.data.website,
                    isFollowed: userProfile.data.isFollowed
                });
            }

            return res.status(userFollowers.code).json({
                message: userFollowers.message,
                payload: userFollowersProfiles,
                status: userFollowers.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async getUserFollowingsProfiles(req: Request, res: Response) {
        try {
            const errors = validationResult(req).mapped();

            if (errors.userId) {
                return res.status(400).json({
                    message: errors.userId.msg,
                    error: 'Bad request error',
                    status: 400
                });
            }

            const userId: string = req.params.userId;
            const userFollowings = await this._userAccount.getFollowings(userId);

            const userFollowingsProfiles: {
                userId: string,
                name: string,
                avatar: string,
                profileTitle: string,
                profileDescription: string,
                website: string,
                isFollowed: boolean
            }[] = [];

            for (const following of userFollowings.data) {
                const userProfile = await this._userAccount.getUserProfile(following.followeeId, req.body.userCognitoSub);

                userFollowingsProfiles.push({
                    userId: userProfile.data.userId,
                    name: userProfile.data.name,
                    avatar: userProfile.data.avatar,
                    profileTitle: userProfile.data.profileTitle,
                    profileDescription: userProfile.data.profileDescription,
                    website: userProfile.data.website,
                    isFollowed: userProfile.data.isFollowed
                });
            }

            return res.status(userFollowings.code).json({
                message: userFollowings.message,
                payload: userFollowingsProfiles,
                status: userFollowings.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async sendPhoneNumberVerification(req: Request, res: Response) {
        try {

            const accessToken: string = req.body.accessToken;
            const userId: string = req.body.userCognitoSub;

            const getUserResult = await this._userAccount.getUser(userId);
            const sendPhoneNumberVerificationResult = await this._userAccount.sendPhoneNumberVerification(accessToken, getUserResult.phone_number);

            return res.status(sendPhoneNumberVerificationResult.code).json({
                message: sendPhoneNumberVerificationResult.message,
                payload: sendPhoneNumberVerificationResult.data,
                status: sendPhoneNumberVerificationResult.code
            });

        } catch (error: any) {

            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async verifyPhoneNumber(req: Request, res: Response) {
        try {

            const errors = validationResult(req).mapped();

            if (errors.verifyCode) {
                return res.status(400).json({
                    message: errors.verifyCode.msg,
                    error: 'Bad request error',
                    status: 400
                });
            }

            const accessToken: string = req.body.accessToken;
            const verifyCode: string = req.body.verifyCode;

            const verifyPhoneNumberResult = await this._userAccount.verifyPhoneNumber(accessToken, verifyCode);

            return res.status(verifyPhoneNumberResult.code).json({
                message: verifyPhoneNumberResult.message,
                payload: verifyPhoneNumberResult.data,
                status: verifyPhoneNumberResult.code
            });

        } catch (error: any) {

            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async getAccountVerificationStatus(req: Request, res: Response) {
        try {

            const accessToken: string = req.body.accessToken;
            const getAccountVerificationStatusResult = await this._userAccount.getAccountVerificationStatus(accessToken);

            return res.status(getAccountVerificationStatusResult.code).json({
                message: getAccountVerificationStatusResult.message,
                payload: getAccountVerificationStatusResult.data,
                status: getAccountVerificationStatusResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 409) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Conflict',
                    status: 409
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    private getUsernameAlias(email: string) {

        let usernameAlias = '';
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        const phoneNumberRegex = /^\+([0-9]{4})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/

        if (emailRegex.test(email)) {
            usernameAlias = 'email';
        } else if (phoneNumberRegex.test((email))) {
            usernameAlias = 'phone_number';
        } else {
            usernameAlias = 'username';
        }

        return usernameAlias;
    }
}

export default UserController;