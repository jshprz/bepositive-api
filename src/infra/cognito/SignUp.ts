import AwsCognito from "./AwsCognito";
import { SignUpInterface, doSignUpParamTypes, verifyUserParamTypes } from "../../interface/cognito/SignUpInterface";
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';
import { errors } from '../../config';
import { ISignUpResult } from "amazon-cognito-identity-js";

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);
@Service()
class SignUp extends AwsCognito implements SignUpInterface {

  /**
   * Registers a user to AWS Cognito user pool.
   * @param body { username: string, email: string, password: string }
   * @returns Promise<ISignUpResult | undefined>
   */
  async doSignUp(body: doSignUpParamTypes): Promise<ISignUpResult | undefined> {
    return new Promise(async (resolve, reject) => {
      const cognitoAttributeList = this.cognitoUserAttributeList(body.email, body.name);

      this.userPool().signUp(body.username, body.password, cognitoAttributeList, [], (error: Error | undefined, result: ISignUpResult | undefined) => {
        if (error) {
          this._log.error({
            label: `${filePath} - doSignUp()`,
            message: error,
            payload: body
          });

          reject(errors.AWS_COGNITO_ERROR);
        }

        resolve(result);
      });
    });
  }

  /**
   * Verifies user registration through a verification code from the user's email.
   * @param body { username: string, verifyCode: string }
   * @returns Promise<string>
   */
  async verifyUser(body: verifyUserParamTypes): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(body.username).confirmRegistration(body.verifyCode, true, (error: string, result: string) => {
        if (error) {
          this._log.error({
            label: `${filePath} - verifyUser()`,
            message: error,
            payload: body
          });

          reject(errors.AWS_COGNITO_ERROR);
        }

        resolve(result);
      });
    })
  }

  /**
   * Updates email_verified attribute to true within the AWS Cognito user pool.
   * @param username: string
   * @returns Promise<boolean>
   */
  async updateEmailVerifiedToTrue(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._client.adminUpdateUserAttributes({
        UserAttributes: [{
            Name: 'email_verified',
            Value: 'true'
          }
          // other user attributes like phone_number or email themselves, etc
        ],
        UserPoolId: process.env.AWS_COGNITO_POOL_ID,
        Username: username

      }, (error: string) => {
        if (error) {
          this._log.error({
            label: `${filePath} - updateEmailVerifiedToTrue()`,
            message: error,
            payload: {}
          });

          reject(errors.AWS_COGNITO_ERROR);
        } else {
          resolve(true);
        }
      });
    });
  }

}

export default SignUp;