import AwsCognito from './AwsCognito';
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';
import { ResetPasswordInterface, resetPasswordParamTypes } from '../../interface/authentication/ResetPasswordInterface';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
export class ResetPassword extends AwsCognito implements ResetPasswordInterface {

  async forgotPassword(emailOrUsername: string) {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.getCognitoUser(emailOrUsername);
      cognitoUser.forgotPassword({
        onSuccess: (result) => resolve(result),
        onFailure: (error) => {
          this._log.error({
            label: `${filePath} - forgotPassword()`,
            message: error,
            payload: {}
          });

          reject(error);
        }
      });
    });
  }

  async resetPassword(body: resetPasswordParamTypes): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(body.username).confirmPassword(body.verifyCode, body.newPassword, {
        onSuccess: (result) => resolve(result),
        onFailure: (error) => {
          this._log.error({
            label: `${filePath} - resetPassword()`,
            message: error,
            payload: {}
          });

          reject(error);
        }
      });
    });
  }
}