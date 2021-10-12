import { CognitoUserSession } from "amazon-cognito-identity-js";
import { Request } from 'express';

declare module 'amazon-cognito-identity-js' {
  interface CognitoUserSession {
    accesstoken: {
      jwtToken: string
    };
  }
}

export type doSignInParamTypes = {
  emailOrUsername: string;
  password: string;
}

export interface SignInInterface {
  doSignIn(body: doSignInParamTypes): Promise<CognitoUserSession>;
  doSignOut(req: Request): Promise<boolean>;
}