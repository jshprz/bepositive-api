import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { UserFeeds } from '../../database/postgresql/models/UserFeeds';
import { UserFeedRepositoryInterface } from '../../interface/repositories/UserFeedRepositoryInterface';
import path from 'path';
import { errors } from '../../config/index';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class UserFeedRepository extends BaseRepository implements UserFeedRepositoryInterface {

  /**
   * Creates a follower's feed.
   * @param userId: string
   * @param postId: number | undefined
   * @returns Promise<boolean>
  */
  createFeed(userId: string, postId: number | undefined): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const userFeedsModel = new UserFeeds();

      userFeedsModel.user_id = userId;
      userFeedsModel.post_id = postId;
      userFeedsModel.created_at = Number(Date.now());

      await userFeedsModel.save().then(() => {

        return resolve(true);
      }).catch((error) => {

        this._log.error({
          label: `${filePath} - createFeed()`,
          message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
          payload: {
            userId,
            postId
          }
        });

        return reject(errors.DATABASE_ERROR.CREATE);
      });
    });
  }
}

export default UserFeedRepository;