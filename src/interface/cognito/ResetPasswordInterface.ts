export type resetPasswordParamTypes = {
  emailOrUsername: string,
  verifyCode: string,
  newPassword: string
}

export interface ResetPasswordInterface {
  forgotPassword(emailOrUsername: string): Promise<string>;
  resetPassword(body: resetPasswordParamTypes): Promise<string>;
}