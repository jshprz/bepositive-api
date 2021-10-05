export type resetPasswordParamTypes = {
  emailOrUsername: string,
  verifyCode: string,
  newPassword: string
}

export interface ResetPasswordInterface {
  forgotPassword(emailOrUsername: string): Promise<any>;
  resetPassword(body: resetPasswordParamTypes): Promise<any>;
}