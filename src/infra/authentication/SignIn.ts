import AwsCognito from "./AwsCognito";
import { SignInInterface, doSignInParamTypes } from "../../interface/authentication/SignInInterface";
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
export class SignIn extends AwsCognito implements SignInInterface {

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

}