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
  doSignUp(body: doSignUpParamTypes): Promise<any>;
  verifyUser(body: verifyUserParamTypes): Promise<any>;
}