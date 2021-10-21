import { ISignUpResult } from "amazon-cognito-identity-js";

export type doSignUpParamTypes = {
  email: string;
  name: string;
  password: string;
}

export type verifyUserParamTypes = {
  email: string,
  verifyCode: string
}

export interface SignUpInterface {
  doSignUp(body: doSignUpParamTypes): Promise<ISignUpResult | undefined>;
  verifyUser(body: verifyUserParamTypes): Promise<string>;
  updateEmailVerifiedToTrue(email: string): Promise<boolean>;
}