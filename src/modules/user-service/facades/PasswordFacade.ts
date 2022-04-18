import IAwsCognito from '../infras/aws/IAwsCognito';
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";

type resetPasswordParamTypes = {
    email: string,
    verifyCode: string,
    newPassword: string
}

class Password {

    private _log;

    constructor(private _awsCognito: IAwsCognito) {
        this._log = Logger.createLogger('Password.ts');
    }

    /**
     * Sends reset password verification code through email.
     * @param email: string
     * @returns Promise<string>
     */
    forgotPassword(email: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const cognitoUser = this._awsCognito.getCognitoUser(email);

            cognitoUser.forgotPassword({
                onSuccess: (result: string | PromiseLike<string>) => resolve(result),
                onFailure: (error: any) => {
                    this._log.error({
                        function: 'forgotPassword()',
                        message: error,
                        payload: { email }
                    });

                    return reject(Error.AWS_COGNITO_ERROR);
                }
            });
        });
    }

    /**
     * Resets user account password within the AWS Cognito user pool.
     * @param body: { email: string, verifyCode: string, newPassword: string }
     * @returns Promise<string>
     */
    resetPassword(body: resetPasswordParamTypes): Promise<string> {
        return new Promise((resolve, reject) => {
            this._awsCognito.getCognitoUser(body.email).confirmPassword(body.verifyCode, body.newPassword, {
                onSuccess: (result: string | PromiseLike<string>) => resolve(result),
                onFailure: (error: any) => {
                    this._log.error({
                        function: 'resetPassword()',
                        message: error,
                        payload: body
                    });

                    if (error.code && (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException')) {
                        return reject(error);
                    }

                    return reject(Error.AWS_COGNITO_ERROR);
                }
            });
        });
    }
}

export default Password;