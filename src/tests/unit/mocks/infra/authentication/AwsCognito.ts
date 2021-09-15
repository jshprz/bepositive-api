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
}
abstract class AwsCognito {

  userPool() {
    const poolData: any = {
      UserPoolId: process.env.COGNITO_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID
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
}

export default AwsCognito;