import IAwsCognito from '../infras/aws/IAwsCognito';
import IUserProfileRepository from "../infras/repositories/IUserProfileRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { ISignUpResult } from "amazon-cognito-identity-js";
import { QueryFailedError } from "typeorm";

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

    constructor(private _awsCognito: IAwsCognito, private _userProfileRepository: IUserProfileRepository) {
        this._log = Logger.createLogger('RegistrationFacade.ts');
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
    register(body: registerParamTypes): Promise<{
        message: string,
        data: ISignUpResult,
        code: number
    }> {
        return new Promise((resolve, reject) => {
           const cognitoAttributeList = this._awsCognito.cognitoUserAttributeList(body.email, body.name);

           this._awsCognito.userPool().signUp(body.email, body.password, cognitoAttributeList, [], async (error: any, result?: ISignUpResult) => {

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
    verifyUser(body: verifyUserParamTypes): Promise<string> {
        return new Promise((resolve, reject) => {
           this._awsCognito.getCognitoUser(body.email).confirmRegistration(body.verifyCode, true, (error: any, result: string) => {
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
    createUserProfileData(item: {userId: string, email: string, name: string}): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const checkUserProfileData = await this._userProfileRepository.getUserProfileByEmail(item.email).catch((error: string) => {
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
            if (checkUserProfileData === 0) {
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
}

export default RegistrationFacade;