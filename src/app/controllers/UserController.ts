import multer from "multer";
import mime from "mime";
import path from "path";

// Infras
import AwsCognito from "../../modules/user-service/infras/aws/AwsCognito";
import AwsS3 from "../../modules/user-service/infras/aws/AwsS3";
import AccessTokenRepository from "../../modules/user-service/infras/repositories/AccessTokenRepository";
import UserRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository";
import UserProfileRepository from "../../modules/user-service/infras/repositories/UserProfileRepository";

// Facades
import loginFacade from "../../modules/user-service/facades/LoginFacade";
import passwordFacade from "../../modules/user-service/facades/PasswordFacade";
import registrationFacade from "../../modules/user-service/facades/RegistrationFacade";
import userAccountFacade from "../../modules/user-service/facades/UserAccountFacade";

import { Request, Response } from 'express';
import { validationResult } from "express-validator";

// Declaration merging on aws-cognito-identity-js
import '../../declarations/DAwsCognito'
import {timestampsType} from "../../modules/types";

import ResponseMutator from "../../utils/ResponseMutator";
import jwtDecode from "jwt-decode";
import moment from "moment";

type validateFileMimeTypeType = {
    isFailed: boolean,
    message: string | null
}

class UserController {

    private _loginFacade;
    private _passwordFacade;
    private _registrationFacade;
    private _userAccountFacade;
    private _upload;
    private _utilResponseMutator;

    constructor() {
        this._loginFacade = new loginFacade(new AwsCognito, new AccessTokenRepository());
        this._passwordFacade = new passwordFacade(new AwsCognito());
        this._registrationFacade = new registrationFacade(new AwsCognito(), new UserProfileRepository());
        this._userAccountFacade = new userAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
        this._upload = multer().single('avatarFile');
        this._utilResponseMutator = new ResponseMutator();
    }

    async normalLogin(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
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
            const signin = await this._loginFacade.normalLogin(req.body);

            const accessToken: string = signin.accessToken.jwtToken;
            const refreshToken: string = signin.refreshToken.token;
            const accessTokenExpiration: number = signin.accessToken.payload.exp;
            const userCognitoSub: string = signin.idToken.payload.sub;

            // Creates accessToken record within the access_tokens table.
            await this._loginFacade.createAccessTokenItem(accessToken, userCognitoSub);

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

            if (error.code && error.code === 'NotAuthorizedException') {

                response.message = error.message;
                response.error = 'Unauthorized';
                response.status = 401;

            } else if (error.code && error.code === 'UserNotConfirmedException') {

                response.message = error.message;
                response.error = 'Forbidden';
                response.status = 403;

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

    async logout(req: Request, res: Response) {
        try {
            const userCognitoSub: string = req.body.userCognitoSub;

            await this._loginFacade.logout(req);
            await this._loginFacade.deleteAccessTokenItem(userCognitoSub);

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
            await this._passwordFacade.forgotPassword(email);

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
            await this._passwordFacade.resetPassword(req.body);

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

        if (errors.email) {
            return res.status(400).json({
                message: errors.email.msg,
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
            const { email, name, password } = req.body;

            const registerResult = await this._registrationFacade.register({
                email,
                name,
                password
            });
            // We create user profile data in user_profiles table every user registration
            // so that we don't need to rely on AWS Cognito when we need to retrieve a user profile data.
            const createUserProfileData = await this._registrationFacade.createUserProfileData({
                userId: registerResult.data.userSub,
                email,
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
            await this._registrationFacade.verifyUser(req.body);
            await this._registrationFacade.updateEmailVerifiedToTrue(email);

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
            await this._registrationFacade.resendAccountConfirmationCode(req.body.email);

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
            const userProfile = await this._userAccountFacade.getUserProfile(userId);

            // Logged-in users can access their own profiles whether their privacy is set to public or not.
            // Logged-in users can only access other users' profiles that are set to public.
            if (userProfile.data.isPublic || userProfile.data.userId === req.body.userCognitoSub) {

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
                        profile: userProfile.data
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
                await this._userAccountFacade.getUser(item);
            }

            const followUserResult = await this._userAccountFacade.followUser(followeeCognitoSub, followerCognitoSub);

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
                await this._userAccountFacade.getUser(item);
            }

            const followUserResult = await this._userAccountFacade.unfollowUser(followeeCognitoSub, followerCognitoSub);

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
                            const uploadProfileAvatarResult = await this._userAccountFacade.uploadProfileAvatar(userId, req.file.originalname, req.file.mimetype, req.file.buffer);

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

            const updatePrivacyResult = await this._userAccountFacade.updatePrivacyStatus(userId, isPublic);

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
            const generateNewAccessTokenResult = await this._loginFacade.generateNewAccessToken(refreshToken);

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
                await this._loginFacade.deleteAccessTokenItem(decodedAccessToken.sub);

                // We store the access token in our database, so we can manipulate it.
                await this._loginFacade.createAccessTokenItem(newAccessToken, decodedNewAccessToken.sub);

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
}

export default UserController;