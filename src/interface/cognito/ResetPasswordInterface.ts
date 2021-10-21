export type resetPasswordParamTypes = {
  email: string,
  verifyCode: string,
  newPassword: string
}

export interface ResetPasswordInterface {
  forgotPassword(email: string): Promise<string>;
  resetPassword(body: resetPasswordParamTypes): Promise<string>;
}