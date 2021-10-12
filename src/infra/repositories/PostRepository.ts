import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { Posts } from '../../database/postgresql/models/Posts';
import path from 'path';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import { errors } from '../../config/index';
import { getRepository } from 'typeorm';
import { Geometry } from "geojson";

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class PostRepository extends BaseRepository implements PostRepositoryInterface {

  /**
   * Creates post record in the database.
   * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
   * @returns Promise<string>
   */
  async create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[] }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const postsModel = new Posts();

      postsModel.user_cognito_sub = item.userCognitoSub;
      postsModel.caption = item.caption;
      postsModel.status = 'active';
      postsModel.view_count = 0;
      postsModel.s3_files = item.files;
      postsModel.created_at = Number(Date.now());

      await postsModel.save().catch((error) => {

        this._log.error({
          label: `${filePath} - create()`,
          message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
          payload: item
        });

        return reject(errors.DATABASE_ERROR.CREATE);
      });

      return resolve('Post successfully created');
    });
  }

  /**
   * Gets user posts.
   * @param userCognitoSub: string
   * @returns Promise<{
    posts_id: number,
    posts_user_cognito_sub: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]>
   */
  async getPostsByUserCognitoSub(userCognitoSub: string): Promise<{
    posts_id: number,
    posts_user_cognito_sub: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]> {

    return new Promise(async (resolve, reject) => {
      const posts: {
        posts_id: number,
        posts_user_cognito_sub: string,
        posts_caption: string,
        posts_status: string,
        posts_view_count: number,
        posts_lat_long: Geometry,
        posts_s3_files: { key: string, type: string }[],
        posts_created_at: number,
        posts_updated_at: number,
        posts_deleted_at: number
      }[] | void = await getRepository(Posts)
        .createQueryBuilder('posts')
        .select('posts')
        .where('user_cognito_sub = :userCognitoSub', { userCognitoSub })
        .getRawMany().catch((error) => {
          this._log.error({
            label: `${filePath} - getPostsByUserCognitoSub()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: userCognitoSub
          });

          return reject(errors.DATABASE_ERROR.GET);
        });

      return resolve(posts || []);
    });
  }

  /**
   * Gets user posts.
   * @param userCognitoSub: string
   * @returns Promise<{
    posts_id: number,
    posts_user_cognito_sub: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]>
   */
  async getPostsByUserCognitoSub(userCognitoSub: string): Promise<{
    posts_id: number,
    posts_user_cognito_sub: string,
    posts_caption: string,
    posts_status: string,
    posts_view_count: number,
    posts_lat_long: Geometry,
    posts_s3_files: { key: string, type: string }[],
    posts_created_at: number,
    posts_updated_at: number,
    posts_deleted_at: number
  }[]> {

    return new Promise(async (resolve, reject) => {
      const posts: {
        posts_id: number,
        posts_user_cognito_sub: string,
        posts_caption: string,
        posts_status: string,
        posts_view_count: number,
        posts_lat_long: Geometry,
        posts_s3_files: { key: string, type: string }[],
        posts_created_at: number,
        posts_updated_at: number,
        posts_deleted_at: number
      }[] | void = await getRepository(Posts)
        .createQueryBuilder('posts')
        .select('posts')
        .where('user_cognito_sub = :userCognitoSub', { userCognitoSub })
        .getRawMany().catch((error) => {
          this._log.error({
            label: `${filePath} - getPostsByUserCognitoSub()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: userCognitoSub
          });

          return reject(errors.DATABASE_ERROR.GET);
        });

      return resolve(posts || []);
    });
  }
}

export default PostRepository;