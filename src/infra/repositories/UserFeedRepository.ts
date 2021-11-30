import 'reflect-metadata';
import { Service } from 'typedi';
import BaseRepository from './BaseRepository';
import { UserFeeds } from '../../database/postgresql/models/UserFeeds';
import { Posts } from '../../database/postgresql/models/Posts';
import { UserFeedRepositoryInterface } from '../../interface/repositories/UserFeedRepositoryInterface';
import path from 'path';
import { errors } from '../../config';
import { getRepository } from 'typeorm';

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

  /**
   * Retrieve feed from user followings.
   * @param pagination: {page: number, size: number}
   * @param followings: string[],
   * @returns Promise<{
   *  id: number,
   *  user_id: string,
   *  caption: string,
   *  status: string,
   *  view_count: number,
   *  google_maps_place_id: string,
   *  s3_files: { key: string, type: string }[],
   *  created_at: number,
   *  updated_at: number,
   *  deleted_at: number,
   *  location_details: string,
   *  user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
   * }[]>
   */
  async getFeed(pagination: {page: number, size: number}, followings: string[] | any): Promise<{
    id: number,
    user_id: string,
    caption: string,
    status: string,
    view_count: number,
    google_maps_place_id: string,
    s3_files: { key: string, type: string }[],
    created_at: number,
    updated_at: number,
    deleted_at: number,
    location_details: string,
    user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
  }[]> {
    const {page, size} = pagination;
    return new Promise(async (resolve, reject) => {
      const posts: Posts[] | void = await getRepository(Posts)
        .createQueryBuilder('posts')
        .skip((page - 1) * size)
        .take(size)
        .where(qb => {
          const subQuery = qb.subQuery()
            .select("user_feeds.post_id")
            .from(UserFeeds, "user_feeds")
            .where("user_feeds.user_id IN (:...followings)", {followings})
            .getQuery();
          return "posts.id IN " + subQuery + " order by posts.created_at desc";
        }).getMany().catch((error) => {
          this._log.error({
            label: `${filePath} - getFeed()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: followings
          });
          return reject(errors.DATABASE_ERROR.GET);
        });
      // @ts-ignore
      return resolve(posts);
    });
  }

  /**
   * Retrieves feed from current trends.
   * @param pagination: {page: number, size: number}
   * @param threshold: number
   * @returns Promise<{
   *  id: number,
   *  user_id: string,
   *  caption: string,
   *  status: string,
   *  view_count: number,
   *  google_maps_place_id: string,
   *  s3_files: { key: string, type: string }[],
   *  created_at: number,
   *  updated_at: number,
   *  deleted_at: number,
   *  likes: number,
   *  user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
   * }[]>
   */
  async getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<{
    id: number,
    user_id: string,
    caption: string,
    status: string,
    view_count: number,
    google_maps_place_id: string,
    s3_files: { key: string, type: string }[],
    created_at: number,
    updated_at: number,
    deleted_at: number,
    likes: number,
    location_details: string,
    user?: { username: string; sub: string; email_verified: string; name: string; email: string; dateCreated: Date; dateModified: Date; enabled: boolean; status: string }
  }[]> {
    const {page, size} = pagination;
    return new Promise(async (resolve, reject) => {
      const posts: {
        id: number,
        user_id: string,
        caption: string,
        status: string,
        view_count: number,
        google_maps_place_id: string,
        s3_files: { key: string, type: string }[],
        created_at: number,
        updated_at: number,
        deleted_at: number,
        likes: number
      }[] | void  = await getRepository(Posts)
        .createQueryBuilder('posts')
        .skip((page - 1) * size)
        .take(size)
        .select(['posts.*', 'COUNT(post_likes.post_id) as likes'])
        .addFrom('PostLikes', 'post_likes')
        .where('post_likes.post_id = posts.id')
        .having('COUNT(post_likes.post_id) >= :threshold', {threshold})
        .groupBy('posts.id')
        .addGroupBy('posts.user_id')
        .orderBy('likes', 'DESC')
        .getRawMany().catch((error) => {
          this._log.error({
            label: `${filePath} - getTrendingFeed()`,
            message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
            payload: {pagination, threshold}
          });
          return reject(errors.DATABASE_ERROR.GET);
        });
      // @ts-ignore
      return resolve(posts || []);
    });
  }
}

export default UserFeedRepository;