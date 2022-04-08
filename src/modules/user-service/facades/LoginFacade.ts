import IAwsCognito from '../infras/aws/IAwsCognito';
import IAccessTokenRepository from "../infras/repositories/IAccessTokenRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Request } from 'express';
import { QueryFailedError } from "typeorm";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { InitiateAuthResponse } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { AWSError } from "aws-sdk";

type normalLoginParam = {
  email: string,
  password: string
};

class LoginFacade {

    private _log;

    constructor(private _awsCognito: IAwsCognito, private _accessTokenRepository: IAccessTokenRepository) {
        this._log = Logger.createLogger('LoginFacade.ts');
    }

    /**
     * Signs in a user via AWS Cognito user pool.
     * @param body { email: string, password: string }
     * @returns Promise<CognitoUserSession>
     */
    normalLogin(body: normalLoginParam): Promise<CognitoUserSession> {
        return new Promise((resolve, reject) => {
           const authenticationDetails = this._awsCognito.getAuthenticationDetails(body);

           this._awsCognito.getCognitoUser(body.email).authenticateUser(authenticationDetails, {
               onSuccess: (result: CognitoUserSession) => resolve(result),
               onFailure: (error: { message: string, code: string }) => {
                   this._log.error({
                       message: error.message,
                       payload: body
                   });
                   if (error.code && (error.code === 'NotAuthorizedException' || error.code === 'UserNotConfirmedException')) {
                       return reject(error);
                   }

                   return reject(Error.AWS_COGNITO_ERROR);
               }
           });
        });
    }

    /**
     * Signs out a user via AWS Cognito user pool.
     * @param req: Request
     * @returns Promise<boolean>
     */
    logout(req: Request): Promise<boolean> {
        return new Promise((resolve, reject) => {
           const param = {
               AccessToken: req.body.accessToken,
           };
           this._awsCognito.getAwsCognitoClient().globalSignOut(param, (error: Error) => {
              if (error) {
                  this._log.error({
                      message: error.toString(),
                      payload: param
                  });

                  return reject(Error.AWS_COGNITO_ERROR);
              }

              return resolve(true);
           });
        });
    }

    /**
     * Creates AccessTokens data
     * @param accessToken: string
     * @param userCognitoSub: string
     * @returns Promise<boolean>
     */
    createAccessTokenItem(accessToken: string, userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const item = { accessToken, userCognitoSub };
            await this._accessTokenRepository.create(item)
                .catch((error: QueryFailedError) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: {
                            accessToken,
                            userCognitoSub
                        }
                    });
                    return reject(Error.DATABASE_ERROR.CREATE);
                });
            return resolve(true);
        });
    }

    /**
     * Deletes AccessTokens data by email
     * @param userCognitoSub: string
     * @returns Promise<boolean>
     */
    deleteAccessTokenItem(userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this._accessTokenRepository.delete(userCognitoSub)
                .catch((error: QueryFailedError) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: {
                            userCognitoSub
                        }
                    });
                    return reject(Error.DATABASE_ERROR.DELETE);
                });
            return resolve(true);
        });
    }

    /**
     * Generate new access token based on the provided refresh token.
     * @param refreshToken: string
     * @returns Promise<{
     *         message: string,
     *         data: InitiateAuthResponse,
     *         code: number
     *     }>
     */
    generateNewAccessToken(refreshToken: string): Promise<{
        message: string,
        data: InitiateAuthResponse,
        code: number
    }> {
        return new Promise((resolve, reject) => {
            this._awsCognito.getAwsCognitoClient().initiateAuth({
                ClientId: String(process.env.AWS_COGNITO_APP_CLIENT_ID),
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                AuthParameters: {
                    REFRESH_TOKEN: refreshToken,
                    DEVICE_KEY: ''
                }
            }, (error: AWSError, data: InitiateAuthResponse) => {
                if (error) {
                    return reject({
                        message: error,
                        code: 500
                    });
                }

                return resolve({
                    message: 'New access token has been generated successfully.',
                    data,
                    code: 200
                });
            });
        });
    }
}

export default LoginFacade;