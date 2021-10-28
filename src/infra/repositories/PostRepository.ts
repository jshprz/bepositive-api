import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { Posts } from '../../database/postgresql/models/Posts';
import path from 'path';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import { errors } from '../../config/index';
import { getRepository } from 'typeorm';
import { Geometry } from "geojson";
import { resolve } from 'url';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class PostRepository extends BaseRepository implements PostRepositoryInterface {

  /**
   * Creates post record in the database.
   * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
   * @returns Promise<string>
   */
  async create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[] }): Promise<number | undefined> {
    return new Promise(async (resolve, reject) => {
      const postsModel = new Posts();

      postsModel.user_id = item.userCognitoSub;
      postsModel.caption = item.caption;
      postsModel.status = 'active';
      postsModel.view_count = 0;
      postsModel.s3_files = item.files;
      postsModel.created_at = Number(Date.now());

      await postsModel.save().then((result) => {

        return resolve(result.id);
      }).catch((error) => {

        this._log.error({
          label: `${filePath} - create()`,
          message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
          payload: item
        });

        return reject(errors.DATABASE_ERROR.CREATE);
      });
    });
  }

  /**
   * Gets user posts.
   * @param userCognitoSub: string
   * @returns Promise<{
    posts_id: number,
    posts_user_id: string,
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
    posts_user_id: string,
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
        posts_user_id: string,
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
        .where('user_id = :userCognitoSub', { userCognitoSub })
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
   * Get a post by id.
   * @param id: number
   * @returns Promise<Posts | void>
   */
  async getPostById(id: number): Promise<Posts | void> {
    
    return new Promise(async (resolve, reject) => {
      
      const post: Posts | void = await getRepository(Posts)
        .createQueryBuilder('posts')
        .select('posts')
        .where('id = :id', {id})
        .andWhere('deleted_at IS NULL')
        .andWhere('status != :status', {status: 'deleted'})
        .getOne().catch((error) => {
          this._log.error({
            label: `${filePath} - getPostById()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: id
          });

          return reject(errors.DATABASE_ERROR.GET);
        });
        
        return resolve(post);
    });
  }

  /**
   * Updates a post from posts table.
   * @param id: number
   * @param caption: string
   * @returns Promise<boolean>
   */
   async updatePost(id: number, caption: string): Promise<boolean> {
     
    return new Promise(async (resolve, reject) => {
      await getRepository(Posts)
        .createQueryBuilder('posts')
        .update(Posts)
        .set({
          caption: caption,
          updated_at: Number(Date.now())
        })
        .where('id = :id', {id})
        .andWhere('deleted_at IS NULL')
        .andWhere('status != :status', {status: 'deleted'})
        .execute().catch((error) => {
          this._log.error({
            label: `${filePath} - updatePost()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: {
              id,
              caption
            }
          });

          return reject(errors.DATABASE_ERROR.UPDATE);
        });
      
        return resolve(true);
    });
  }

  /**
   * Removes a post by id.
   * @param id: number
   * @returns Promise<boolean>
   */
   async removePostById(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {

      await getRepository(Posts)
        .createQueryBuilder('posts')
        .update(Posts)
        .set({
          status: 'deleted',
          deleted_at: Number(Date.now())
        })
        .where('id = :id', {id})
        .execute().catch((error) => {
          this._log.error({
            label: `${filePath} - delete()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: {
              id
            }
          });

          return reject(errors.DATABASE_ERROR.UPDATE);
        });

      return resolve(true);
    });
  }
}

export default PostRepository;