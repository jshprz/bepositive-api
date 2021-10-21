import AwsCognito from './AwsCognito';
import { Service } from 'typedi';
import 'reflect-metadata';
import path from 'path';
import { ResetPasswordInterface, resetPasswordParamTypes } from '../../interface/cognito/ResetPasswordInterface';
import { errors } from '../../config';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class ResetPassword extends AwsCognito implements ResetPasswordInterface {

  /**
   * Sends reset password verification code through email.
   * @param email: string
   * @returns Promise<string>
   */
  async forgotPassword(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.getCognitoUser(email);

      cognitoUser.forgotPassword({
        onSuccess: (result) => resolve(result),
        onFailure: (error) => {
          this._log.error({
            label: `${filePath} - forgotPassword()`,
            message: error,
            payload: {}
          });

          reject(errors.AWS_COGNITO_ERROR);
        }
      });
    });
  }

  /**
   * Resets user account password within the AWS Cognito user pool.
   * @param body: { email: string, verifyCode: string, newPassword: string }
   * @returns Promise<string>
   */
  async resetPassword(body: resetPasswordParamTypes): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getCognitoUser(body.email).confirmPassword(body.verifyCode, body.newPassword, {
        onSuccess: (result) => resolve(result),
        onFailure: (error: any) => {
          this._log.error({
            label: `${filePath} - resetPassword()`,
            message: error,
            payload: {}
          });

          if (error.code && (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException')) {
            return reject(error);
          }

          return reject(errors.AWS_COGNITO_ERROR);
        }
      });
    });
  }
}

export default ResetPassword;