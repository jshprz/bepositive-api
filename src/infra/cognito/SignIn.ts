import AwsCognito from "./AwsCognito";
import { SignInInterface, doSignInParamTypes } from "../../interface/cognito/SignInInterface";
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';
import { errors } from '../../config/index';
import { Request } from 'express';
import '../../interface/declare/amazon-cognito-identity-js';
import { CognitoUserSession } from "amazon-cognito-identity-js";
import '../../interface/declare/express-session';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class SignIn extends AwsCognito implements SignInInterface {

  /**
   * Signs in a user via AWS Cognito user pool.
   * @param body { email: string, password: string }
   * @returns Promise<CognitoUserSession>
   */
  async doSignIn(body: doSignInParamTypes): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = this.getAuthenticationDetails(body);

      this.getCognitoUser(body.email).authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(result),
        onFailure: error => {
          this._log.error({
            label: `${filePath} - doSignIn()`,
            message: error,
            payload: body
          });

          if (error.code && (error.code === 'NotAuthorizedException' || error.code === 'UserNotConfirmedException')) {
            return reject(error);
          }

          return reject(errors.AWS_COGNITO_ERROR);
        }
      });
    });
  }

  /**
   * Signs out a user via AWS Cognito user pool.
   * @param req: Request
   * @returns Promise<boolean>
   */
  async doSignOut(req: Request): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const param = {
        AccessToken: req.session.accessToken,
      }
      this._client.globalSignOut(param, (error: string) => {
        if (error) {
          this._log.error({
            label: `${filePath} - doSignOut()`,
            message: error,
            payload: req.session
          });

          reject(errors.AWS_COGNITO_ERROR);
        } else {
          req.session.destroy((error: string) => {
            if (error) {
              this._log.error({
                label: `${filePath} - doSignOut()`,
                message: error,
                payload: req.session
              });

              reject(errors.APP_SESSION_ERROR);
            }

            resolve(true);
          });
        }
      });
    });
  }
}

export default SignIn;