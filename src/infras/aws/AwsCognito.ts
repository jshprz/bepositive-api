import AWS from 'aws-sdk';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import IAwsCognito from "./IAwsCognito";

const cognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;

class AwsCognito implements IAwsCognito{

  private readonly _client;

  constructor() {
    this._client = new cognitoIdentityServiceProvider({
      region: 'ap-southeast-2'
    });
  }

  /**
   * Sets up AWS Cognito user pool instance.
   * @returns instance of CognitoUserPool from 'amazon-cognito-identity-js' library.
   */
  userPool(): CognitoUserPool {
    const poolData = {
      UserPoolId: String(process.env.AWS_COGNITO_POOL_ID),
      ClientId: String(process.env.AWS_COGNITO_APP_CLIENT_ID)
    };

    return new CognitoUserPool(poolData);
  }

  /**
   * Sets AWS Cognito user attribute.
   * @param email string
   * @param name string
   * @returns CognitoUserAttribute[]
   */
  cognitoUserAttributeList(email: string, name: string): CognitoUserAttribute[] {
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
  getCognitoUser(email: string): CognitoUser {
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
  getAuthenticationDetails(body: {email: string, password: string}): AuthenticationDetails {
    const authenticationData = { Username: body.email, Password: body.password };

    return new AuthenticationDetails(authenticationData);
  }

  /**
   * Gets AWS Cognito client instance.
   * @returns instance of cognitoIdentityServiceProvider
   */
  getAwsCognitoClient(): AWS.CognitoIdentityServiceProvider {
    return this._client;
  }
}

export default AwsCognito;