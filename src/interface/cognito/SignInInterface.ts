import { CognitoUserSession } from "amazon-cognito-identity-js";
import { Request } from 'express';
import '../declare/amazon-cognito-identity-js';

export type doSignInParamTypes = {
  email: string;
  password: string;
}

export interface SignInInterface {
  doSignIn(body: doSignInParamTypes): Promise<CognitoUserSession>;
  doSignOut(req: Request): Promise<boolean>;
}