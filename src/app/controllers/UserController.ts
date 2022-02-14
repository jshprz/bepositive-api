// Infras
import awsCognito from "../../modules/user-service/infras/aws/AwsCognito";
import accessTokenRepository from "../../modules/user-service/infras/repositories/AccessTokenRepository";
import userRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository";

// Facades
import loginFacade from "../../modules/user-service/facades/LoginFacade";
import passwordFacade from "../../modules/user-service/facades/PasswordFacade";
import registrationFacade from "../../modules/user-service/facades/RegistrationFacade";
import userAccountFacade from "../../modules/user-service/facades/UserAccountFacade";

import { Request, Response } from 'express';
import { validationResult } from "express-validator";

// Declaration merging on aws-cognito-identity-js
import '../../declarations/DAwsCognito'

class UserController {

    private _loginFacade;
    private _passwordFacade;
    private _registrationFacade;
    private _userAccountFacade;

    constructor() {
        this._loginFacade = new loginFacade(new awsCognito, new accessTokenRepository());
        this._passwordFacade = new passwordFacade(new awsCognito());
        this._registrationFacade = new registrationFacade(new awsCognito());
        this._userAccountFacade = new userAccountFacade(new awsCognito(), new userRelationshipRepository());
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
            const accessTokenExpiration: number = signin.accessToken.payload.exp;
            const userCognitoSub: string = signin.idToken.payload.sub;

            // Creates accessToken record within the access_tokens table.
            await this._loginFacade.createAccessTokenItem(accessToken, userCognitoSub);

            return res.status(200).json({
                message: 'Successfully logged in',
                payload: {
                    accessToken,
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

            await this._registrationFacade.register({
                email,
                name,
                password
            });

            return res.status(200).json({
                message: `User successfully registered. The verification code has been sent to this email: ${email}`,
                payload: {},
                status: 200
            });
        } catch (error: any) {
            return res.status((error.code && error.code === 'UsernameExistsException')? 409 : 500).json({
                message: (error.code && error.code === 'UsernameExistsException')? error.message : error,
                error: (error.code && error.code === 'UsernameExistsException')? 'Conflict' : 'Internal server error',
                status: (error.code && error.code === 'UsernameExistsException')? 409 : 500
            });
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
            const accessToken = req.headers.authorization?.split(' ')[1];
            const profile = await this._userAccountFacade.getUserProfile(accessToken || '');
            const userProfile = {
                username: profile.Username,
                sub: '',
                email_verified: '',
                name: '',
                email: ''
            }

            profile.UserAttributes.forEach(attr => {
                // @ts-ignore
                userProfile[attr.Name] = attr.Value;
            });

            return res.status(200).json({
                message: 'User profile successfully retrieved',
                payload: {
                    profile: userProfile
                },
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
}

export default UserController;