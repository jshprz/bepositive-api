import AwsCognito from "./AwsCognito";
import { SignInInterface, doSignInParamTypes } from "../../interface/cognito/SignInInterface";
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class SignIn extends AwsCognito implements SignInInterface {

  /**
   * Signs in a user via AWS Cognito user pool.
   * @param body { emailOrUsername: string, password: string }
   * @returns Promise<any>
   */
  async doSignIn(body: doSignInParamTypes): Promise<any> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = this.getAuthenticationDetails(body);

      this.getCognitoUser(body.emailOrUsername).authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(result),
        onFailure: error => {
          this._log.error({
            label: `${filePath} - doSignIn()`,
            message: error,
            payload: body
          });

          return reject(error);
        }
      });
    });
  }

  /**
   * Signs out a user via AWS Cognito user pool.
   * @param session: any
   * @returns Promise<boolean>
   */
  async doSignOut(session: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const param = {
        AccessToken: session.accesstoken
      }
      this._client.globalSignOut(param, (error, result) => {
        if (error) {
          this._log.error({
            label: `${filePath} - doSignOut()`,
            message: error,
            payload: session
          });

          return reject(error);
        } else {
          session.destroy((error, result) => {
            if (error) {
              this._log.error({
                label: `${filePath} - doSignOut()`,
                message: error,
                payload: session
              });
              return reject(error);
            }

            return resolve(result);
          });
        }
      });
    });
  }
}

export default SignIn;