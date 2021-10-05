import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { Posts } from '../../database/postgresql/models/Posts';
import path from 'path';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class PostRepository extends BaseRepository implements PostRepositoryInterface {
  
  /**
   * Creates post record in the database.
   * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
   * @returns Promise<string>
   */
  async create(item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const postsModel = new Posts();

      postsModel.user_cognito_sub = item.userCognitoSub;
      postsModel.caption = item.caption;
      postsModel.status = 'active';
      postsModel.view_count = 0;
      postsModel.s3_files = item.s3Files;
      postsModel.created_at = Number(Date.now());

      await postsModel.save().catch((error) => {

        this._log.error({
          label: `${filePath} - create()`,
          message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
          payload: item
        });

        return reject(error);
      });

      return resolve('post successfully created.');
    });
  }
}

export default PostRepository;