import { Container } from 'typedi';
import { utils } from '../utils';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';

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

  getCognitoUser(username: string) {
    const userData = {
      Username: username,
      Pool: this.userPool()
    }

    return new CognitoUser(userData);
  }
}

export default AwsCognito;