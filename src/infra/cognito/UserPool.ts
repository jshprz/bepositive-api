import AwsCognito from "./AwsCognito";
import path from 'path';
import { Service } from "typedi";
import 'reflect-metadata';
import { UserPoolInterface } from "../../interface/cognito/UserPoolInterface";
import { errors } from '../../config';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class UserPool extends AwsCognito implements UserPoolInterface {

  constructor() {
    super();
  }

  /**
   * Gets user information from AWS Cognito using access token
   * @param accesstoken
   * @returns Promise<{Username: string, UserAttributes: []}>
   */
  async getUserProfile(accesstoken: string): Promise<{Username: string, UserAttributes: []}> {
    return new Promise(async (resolve, reject) => {
      const params = { AccessToken: accesstoken}
      this._client.getUser(params, (error: Error, result: {Username: string, UserAttributes: []}) => {
        if (error) {
          this._log.error({
            label: `${filePath} - getUserProfile()`,
            message: error,
            payload: accesstoken
          });

          reject(errors.AWS_COGNITO_ERROR);
        } else {
          resolve(result);
        }
      })
    })
  }
}

export default UserPool;