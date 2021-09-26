export class CognitoUserAttribute {
  constructor(data: { Name: string, Value: string}){};
}

export class CognitoUserPool {
  constructor(data: { UserPoolId: string, ClientId: string }) {};

  public signUp(
    username: string,
    password: string,
    userAttributes: CognitoUserAttribute[],
    validationData: any,
    callback: any,
    clientMetadata?: any
  ) {

    callback(null, 'resolved!');
  }
}

export interface IAuthenticationCallback {
  onSuccess: (
    session: any,
    userConfirmationNecessary?: boolean
  ) => void;
  onFailure: (err: any) => void;
  newPasswordRequired?: (
    userAttributes: any,
    requiredAttributes: any
  ) => void;
  mfaRequired?: (challengeName: any, challengeParameters: any) => void;
  totpRequired?: (challengeName: any, challengeParameters: any) => void;
  customChallenge?: (challengeParameters: any) => void;
  mfaSetup?: (challengeName: any, challengeParameters: any) => void;
  selectMFAType?: (challengeName: any, challengeParameters: any) => void;
}

export class CognitoUser {
  constructor(data: {Username: string, Pool: CognitoUserPool, Storage?: any}) {}

  public confirmRegistration(
    code: string,
    forceAliasCreation: boolean,
    callback: any,
    clientMetadata?: any
  ) {

    callback(null, 'resolved!');
  }

  public authenticateUser(
    authenticationDetails: AuthenticationDetails,
    callback: any
  ) {
    callback(null, 'resolved!')
  }
}

export class AuthenticationDetails {
  constructor(data: { Username: string, Password: string }) {};
}
abstract class AwsCognito {

  userPool() {
    const poolData: any = {
      UserPoolId: process.env.AWS_COGNITO_POOL_ID,
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID
    };

    return new CognitoUserPool(poolData);
  }

  cognitoUserAttributeList(email: string, name: string): any[] {
    const attribute = (key: string, value: string) => {
      return {
        Name: key,
        Value: value
      }
    }

    return [
      new CognitoUserAttribute(attribute('email', email)),
      new CognitoUserAttribute(attribute('name', name))
    ];
  }

  getCognitoUser(username: string) {
    const userData = {
      Username: username,
      Pool: this.userPool()
    }

    return new CognitoUser(userData);
  }

  getAuthenticationDetails(body: {email: string, password: string}) {
    const authenticationData = { Username: body.email, Password: body.password };

    return new AuthenticationDetails(authenticationData);
  }
}

export default AwsCognito;