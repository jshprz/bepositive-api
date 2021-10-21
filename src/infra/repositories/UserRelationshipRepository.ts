import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { UserRelationships } from '../../database/postgresql/models/UserRelationships';
import { UserRelationshipRepositoryInterface } from '../../interface/repositories/UserRelationshipRepositoryInterface';
import path from 'path';
import { errors } from '../../config/index';
import { getRepository } from 'typeorm';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class UserRelationshipRepository extends BaseRepository implements UserRelationshipRepositoryInterface {

  /**
   * Gets user followers.
   * @param userCognitoSub: string
   * @returns Promise<{
      user_relationships_id: number,
      user_relationships_user_id: string,
      user_relationships_following_id: string,
      user_relationships_created_at: number,
      user_relationships_updated_at: number,
      user_relationships_deleted_at: number
    }[]>
   */
  getFollowers(userCognitoSub: string): Promise<{
    user_relationships_id: number,
    user_relationships_user_id: string,
    user_relationships_following_id: string,
    user_relationships_created_at: number,
    user_relationships_updated_at: number,
    user_relationships_deleted_at: number
  }[]> {

    return new Promise(async (resolve, reject) => {
      const followers: {
        user_relationships_id: number,
        user_relationships_user_id: string,
        user_relationships_following_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
      }[] | void = await getRepository(UserRelationships)
      .createQueryBuilder('user_relationships')
      .select('user_relationships')
      .where('user_id = :userCognitoSub', { userCognitoSub })
      .getRawMany().catch((error) => {
        this._log.error({
          label: `${filePath} - getFollowers()`,
          message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
          payload: userCognitoSub
        });

        return reject(errors.DATABASE_ERROR.GET);
      });

      return resolve(followers || []);
    });
  }
}

export default UserRelationshipRepository;