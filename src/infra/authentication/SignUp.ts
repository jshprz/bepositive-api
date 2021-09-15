import AwsCognito from "./AwsCognito";
import { SignUpInterface, doSignUpParamTypes, verifyUserParamTypes } from "../../interface/authentication/SignUpInterface";
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);
@Service()
export class SignUp extends AwsCognito implements SignUpInterface {

  /**
   * Registers a user to AWS Cognito user pool.
   * @param body { username: string, email: string, password: string }
   * @returns Promise<any>
   */
  async doSignUp(body: doSignUpParamTypes): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const cognitoAttributeList = this.cognitoUserAttributeList(body.email, body.name);

      this.userPool().signUp(body.username, body.password, cognitoAttributeList, [], (err, result) => {
        if (err) {
          this._log.error({
            label: `${filePath} - doSignUp()`,
            message: err,
            payload: body
          });

          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  /**
   * Verifies user registration through a verification code from the user's email.
   * @param body { username: string, verifyCode: string }
   * @returns Promise<any>
   */
  async verifyUser(body: verifyUserParamTypes): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(body.username).confirmRegistration(body.verifyCode, true, (err, result) => {
        if (err) {
          this._log.error({
            label: `${filePath} - verifyUser()`,
            message: err,
            payload: body
          });

          return reject(err);
        }
        return resolve(result);
      });
    })
  }

}