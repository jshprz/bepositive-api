import { Service } from 'typedi';
import 'reflect-metadata';
import { AccessTokenRepositoryInterface} from '../../interface/repositories/AccessTokenRepositoryInterface';
import BaseRepository from './BaseRepository';
import { AccessTokens } from '../../database/postgresql/models/AccessTokens';
import { getConnection } from 'typeorm';
import path from 'path';
import { errors } from '../../config/index';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class AccessTokenRepository extends BaseRepository implements AccessTokenRepositoryInterface {

  /**
   * Creates accesstokens data
   * @param accesstoken: string
   * @param email: string
   * @returns Promise<boolean>
   */
  async createAccessTokenItem(accesstoken: string, email: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(AccessTokens)
        .values([
          { accesstoken, email, created_at: Number(Date.now()) }
        ]).execute()
        .catch((error) => {
          this._log.error({
            label: `${filePath} - createAccessTokenItem()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: {
              accesstoken,
              email
            }
          });

          reject(errors.DATABASE_ERROR.CREATE);
        });

        resolve(true);
    });
  }

  /**
   * Deletes accesstokens data by email
   * @param email: string
   * @returns Promise<boolean>
   */
  async deleteAccessTokenItem(email: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(AccessTokens)
        .where('email = :email', { email })
        .execute()
        .catch((error) => {
          this._log.error({
            label: `${filePath} - deleteAccessTokenItem()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: {
              email,
            }
        });

        reject(errors.DATABASE_ERROR.DELETE);
      });

      resolve(true);
    });
  }

}

export default AccessTokenRepository;