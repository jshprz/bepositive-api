import { Service } from 'typedi';
import 'reflect-metadata';
import { AccessTokenRepositoryInterface} from '../../interface/repositories/AccessTokenRepositoryInterface';
import BaseRepository from './BaseRepository';
import { AccessTokens } from '../../database/postgresql/models/AccessTokens';
import { getConnection } from 'typeorm';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class AccessTokenRepository extends BaseRepository implements AccessTokenRepositoryInterface {

  /**
   * Creates accesstokens data
   * @param accesstoken: string
   * @param email: string
   * @returns Promise<any>
   */
  async createAccessTokenItem(accesstoken: string, email: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(AccessTokens)
        .values([
          { accesstoken, email, created_at: Number(Date.now()) }
        ]).execute()
        .catch((err) => {
          this._log.error({
            label: `${filePath} - createAccessTokenItem()`,
            message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
            payload: {
              accesstoken,
              email
            }
          });

          reject(err);
        });

        resolve(true);
    });
  }

  /**
   * Deletes accesstokens data by email
   * @param email: string
   * @returns Promise<any>
   */
  async deleteAccessTokenItem(email: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(AccessTokens)
        .where('email = :email', { email })
        .execute()
        .catch((err) => {
          this._log.error({
            label: `${filePath} - deleteAccessTokenItem()`,
            message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
            payload: {
              email,
            }
        });

        reject(err);
      });

      resolve(true);
    });
  }

}

export default AccessTokenRepository;