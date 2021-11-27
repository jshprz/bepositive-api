import { Container } from 'typedi';
import Logger from '../utils/Logger';
import AWS from 'aws-sdk';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const cognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;

abstract class AwsCognito {

  protected _log: Logger;
  protected _client;

  constructor() {
    this._log = Container.get(Logger);
    this._client = new cognitoIdentityServiceProvider({
      region: 'ap-southeast-2'
    });
  }

  /**
   * Sets up AWS Cognito user pool instance.
   * @returns instance of CognitoUserPool from 'amazon-cognito-identity-js' library.
   */
  userPool(): CognitoUserPool {
    const poolData: any = {
      UserPoolId: process.env.AWS_COGNITO_POOL_ID,
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID
    };

    return new CognitoUserPool(poolData);
  }

  /**
   * Sets AWS Cognito user attribute.
   * @param email string
   * @param name string
   * @returns any[]
   */
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

  /**
   * Gets Cognito user via email.
   * @param email string
   * @returns instance of CognitoUser from 'amazon-cognito-identity-js' library.
   */
  getCognitoUser(email: string) {
    const userData = {
      Username: email,
      Pool: this.userPool()
    }

    return new CognitoUser(userData);
  }

  /**
   * Gets authentication details.
   * @param body {email: string, password: string}
   * @returns instance of AuthenticationDetails from 'amazon-cognito-identity-js' library.
   */
  getAuthenticationDetails(body: {email: string, password: string}) {
    const authenticationData = { Username: body.email, Password: body.password };

    return new AuthenticationDetails(authenticationData);
  }
}

export default AwsCognito;