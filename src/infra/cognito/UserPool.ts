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

  /**
   * Gets user information from AWS Cognito using sub by filtering from  the ListUsers API
   * @param sub string
   * @returns Promise<any>
   */
   async getUser(sub: string): Promise<{
     username: string,
     sub: string,
     email_verified: string,
     name: string,
     email: string,
     dateCreated: Date,
     dateModified: Date,
     enabled: boolean,
     status: string
   }> {
    return new Promise(async (resolve, reject) => {
      const params = { Filter: `sub = "${sub}"`, UserPoolId: process.env.AWS_COGNITO_POOL_ID }

      this._client.listUsers(params, (error:Error, result:any) => {
        if (error) {
          this._log.error({
            label: `${filePath} - getUser()`,
            message: error,
            payload: {"sub": sub}
          });
          return reject(errors.AWS_COGNITO_ERROR);
        } else {
          if (!result.Users.length) {
            return reject(errors.AWS_COGNITO_ERROR);
          } else {
            const rawUser = result.Users[0];
            const user:any | {} = {};
            user.username = rawUser.Username;
            rawUser.Attributes.forEach(attr => {
              user[attr.Name] = attr.Value;
            });
            user.dateCreated = rawUser.UserCreateDate;
            user.dateModified = rawUser.UserLastModifiedDate;
            user.enabled = rawUser.Enabled;
            user.status = rawUser.UserStatus;

            return resolve(user);
          }
        }
      })
    })
  }
}

export default UserPool;