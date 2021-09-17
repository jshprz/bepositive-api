import { Container } from 'typedi';
import { utils } from '../utils';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

abstract class AwsCognito {

  protected _log: any;

  constructor() {
    this._log = Container.get(utils.Logger);
  }

  /**
   * Sets up AWS Cognito user pool instance.
   * @returns instance of CognitoUserPool from 'amazon-cognito-identity-js' library.
   */
  userPool(): CognitoUserPool {
    const poolData: any = {
      UserPoolId: process.env.COGNITO_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID
    };

    return new CognitoUserPool(poolData);
  }

  /**
   * Sets AWS Cognito user attribute.
   * @param email string
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
   * Gets Cognito user via username or an email.
   * @param email string
   * @returns instance of CognitoUser from 'amazon-cognito-identity-js' library.
   */
  getCognitoUser(username: string) {
    const userData = {
      Username: username,
      Pool: this.userPool()
    }

    return new CognitoUser(userData);
  }

  /**
   * Gets authentication details.
   * @param body {emailOrUsername: string, password: string}
   * @returns instance of AuthenticationDetails from 'amazon-cognito-identity-js' library.
   */
  getAuthenticationDetails(body: {emailOrUsername: string, password: string}) {
    const authenticationData = { Username: body.emailOrUsername, Password: body.password };

    return new AuthenticationDetails(authenticationData);
  }
}

export default AwsCognito;