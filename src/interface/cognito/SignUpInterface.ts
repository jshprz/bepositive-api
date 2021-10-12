import { ISignUpResult } from "amazon-cognito-identity-js";

export type doSignUpParamTypes = {
  username: string;
  email: string;
  name: string;
  password: string;
}

export type verifyUserParamTypes = {
  username: string,
  verifyCode: string
}

export interface SignUpInterface {
  doSignUp(body: doSignUpParamTypes): Promise<ISignUpResult | undefined>;
  verifyUser(body: verifyUserParamTypes): Promise<string>;
  updateEmailVerifiedToTrue(username: string): Promise<boolean>;
}