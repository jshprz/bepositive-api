import { CognitoUserSession } from "amazon-cognito-identity-js";
import IAwsCognito from '../infras/aws/IAwsCognito';
import IAccessTokenRepository from "../infras/repositories/IAccessTokenRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Request } from 'express';

// Declaration merging on express-session
import '../../../declarations/DExpressSession';

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
               onSuccess: (result: CognitoUserSession | PromiseLike<CognitoUserSession>) => resolve(result),
               onFailure: (error: { code: string; }) => {
                   this._log.error({
                       message: error.toString(),
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
               AccessToken: req.session.accessToken,
           };
           this._awsCognito.getAwsCognitoClient().globalSignOut(param, (error: Error) => {
              if (error) {
                  this._log.error({
                      message: error.toString(),
                      payload: req.session
                  });

                  return reject(Error.AWS_COGNITO_ERROR);
              } else {
                  req.session.destroy((error: string) => {
                     if (error) {
                         this._log.error({
                             message: error,
                             payload: req.session
                         });

                         return reject(Error.APP_SESSION_ERROR);
                     }

                     return resolve(true);
                  });
              }
           });
        });
    }

    /**
     * Creates AccessTokens data
     * @param accessToken: string
     * @param email: string
     * @returns Promise<boolean>
     */
    createAccessTokenItem(accessToken: string, email: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const item = { accessToken, email };
            await this._accessTokenRepository.create(item)
                .catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            accessToken,
                            email
                        }
                    });
                    return reject(Error.DATABASE_ERROR.CREATE);
                });
            return resolve(true);
        });
    }

    /**
     * Deletes AccessTokens data by email
     * @param email: string
     * @returns Promise<boolean>
     */
    deleteAccessTokenItem(email: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this._accessTokenRepository.delete(email)
                .catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            email
                        }
                    });
                    return reject(Error.DATABASE_ERROR.DELETE);
                });
            return resolve(true);
        });
    }
}

export default LoginFacade;