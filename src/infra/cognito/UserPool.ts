import AwsCognito from "./AwsCognito";
import path from 'path';
import { Service } from "typedi";
import 'reflect-metadata';
import { UserPoolInterface } from "../../interface/cognito/UserPoolInterface";

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class UserPool extends AwsCognito implements UserPoolInterface {

  constructor() {
    super();
  }

  /**
   * Gets user information from AWS Cognito using access token
   * @param accesstoken
   * @returns Promise<any>
   */
  async getUserProfile(accesstoken: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const params = { AccessToken: accesstoken}
      this._client.getUser(params, (error:Error, result:any) => {
        if (error) {
          this._log.error({
            label: `${filePath} - getUserProfile()`,
            message: error,
            payload: accesstoken
          });

          return reject(error);
        } else {
          return resolve(result);
        }
      })
    })
  }
}

export default UserPool;