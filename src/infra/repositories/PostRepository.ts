import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { Posts } from '../../database/postgresql/models/Posts';
import path from 'path';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import { errors } from '../../config/index';
import { getRepository } from 'typeorm';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class PostRepository extends BaseRepository implements PostRepositoryInterface {

  /**
   * Creates post record in the database.
   * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
   * @returns Promise<string>
   */
  async create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Promise<number | undefined> {
    return new Promise(async (resolve, reject) => {
      const postsModel = new Posts();

      postsModel.user_id = item.userCognitoSub;
      postsModel.caption = item.caption;
      postsModel.status = 'active';
      postsModel.view_count = 0;
      postsModel.google_maps_place_id = item.googlemapsPlaceId;
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
    posts_google_maps_place_id: string,
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
    posts_google_maps_place_id: string,
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
        posts_google_maps_place_id: string,
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
   * @returns Promise<{
    id: number | void,
    user_id: string | void,
    caption: string | void,
    status: string | void,
    view_count: number | void,
    google_maps_place_id: string | void,
    s3_files: { key: string, type: string }[] | void,
    created_at: number | void,
    location_details: string | undefined
  }>
   */
  async getPostById(id: number): Promise<{
    id: number | void,
    user_id: string | void,
    caption: string | void,
    status: string | void,
    view_count: number | void,
    google_maps_place_id: string | void,
    s3_files: { key: string, type: string }[] | void,
    created_at: number | void,
    location_details: string
  }> {

    return new Promise(async (resolve, reject) => {

      const post = await getRepository(Posts)
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

        return resolve({
          id: post?.id,
          user_id: post?.user_id,
          caption: post?.caption,
          status: post?.status,
          view_count: post?.view_count,
          google_maps_place_id: post?.google_maps_place_id,
          s3_files: post?.s3_files,
          created_at: post?.created_at,
          location_details: ''
        });
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
          caption,
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