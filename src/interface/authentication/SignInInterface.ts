export type doSignInParamTypes = {
  emailOrUsername: string;
  password: string;
}

export interface SignInInterface {
  doSignIn(body: doSignInParamTypes): Promise<any>;
  doSignOut(req): Promise<string>;
}