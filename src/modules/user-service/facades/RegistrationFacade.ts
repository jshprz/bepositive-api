import IAwsCognito from '../infras/aws/IAwsCognito';
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { ISignUpResult } from "amazon-cognito-identity-js";

type registerParamTypes = {
    email: string;
    name: string;
    password: string;
}

type verifyUserParamTypes = {
    email: string,
    verifyCode: string
}

class RegistrationFacade {

    private _log;

    constructor(private _awsCognito: IAwsCognito) {
        this._log = Logger.createLogger('RegistrationFacade.ts');
    }

    /**
     * User registration through AWS Cognito.
     * @param body: { email: string, verifyCode: string }
     * @returns Promise<ISignUpResult|void>
     */
    register(body: registerParamTypes): Promise<ISignUpResult | void> {
        return new Promise((resolve, reject) => {
           const cognitoAttributeList = this._awsCognito.cognitoUserAttributeList(body.email, body.name);

           this._awsCognito.userPool().signUp(body.email, body.password, cognitoAttributeList, [], (error: any, result: ISignUpResult | void) => {
              if (error) {
                  this._log.error({
                      message: error,
                      payload: body
                  });

                  if (error.code && error.code === 'UsernameExistsException') {
                      return reject(error);
                  }

                  return reject(Error.AWS_COGNITO_ERROR);
              }

              return resolve(result);
           });
        });
    }

    /**
     * Verifies user registration through a verification code from the user's email.
     * @param body { email: string, verifyCode: string }
     * @returns Promise<string>
     */
    verifyUser(body: verifyUserParamTypes): Promise<string> {
        return new Promise((resolve, reject) => {
           this._awsCognito.getCognitoUser(body.email).confirmRegistration(body.verifyCode, true, (error: any, result: string) => {
              if (error) {
                  this._log.error({
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
               UserPoolId: process.env.AWS_COGNITO_POOL_ID,
               Username: email
           }, (error: string) => {
               if (error) {
                   this._log.error({
                       message: error,
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
                ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
                Username: email
            }, (error) => {
                if (error) {
                    this._log.error({
                        message: error,
                        payload: { email }
                    });
                    return reject(error);
                } else {
                    return resolve(true);
                }
            });
        });
    }
}

export default RegistrationFacade;