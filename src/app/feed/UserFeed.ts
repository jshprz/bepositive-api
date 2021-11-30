import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { UserFeedRepositoryInterface } from '../../interface/repositories/UserFeedRepositoryInterface';
import { UserRelationshipRepositoryInterface } from '../../interface/repositories/UserRelationshipRepositoryInterface';
import repositories from '../../infra/repositories';
import cognito from '../../infra/cognito/index';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import '../../interface/declare/express-session';
import { UserPoolInterface } from '../../interface/cognito/UserPoolInterface';
import { Client } from '@googlemaps/google-maps-services-js';

@Service()
class UserFeed {
  private _userFeedRepository: UserFeedRepositoryInterface;
  private _userRelationshipRepository: UserRelationshipRepositoryInterface;
  private _userPool: UserPoolInterface;
  private _googleapis: Client;

  constructor() {
    const container = Container.of();
    this._userFeedRepository = container.get(repositories.UserFeedRepository);
    this._userRelationshipRepository = container.get(repositories.UserRelationshipRepository);
    this._userPool = container.get(cognito.UserPool);
    this._googleapis = new Client({});
  }

  /**
   * Retrieves feed for user followings.
   * @param req: Request
   * @param res: Response
   * @returns res: Response
   */
  async getFeed(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.pagination) {
      return res.status(400).json({
        message: errors.pagination.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (!req.session.user) {
      return res.status(401).json({
      message: 'Please login and try again.',
      error: 'Unauthenticated',
      status: 401
      });
    }

    try {
      const userCognitoSub: string = req.session.user.sub;
      const { pagination } = req.body;
      const rawFollowings = await this._userRelationshipRepository.getFollowings(userCognitoSub);
      const followings: string[] = [userCognitoSub]; // the current logged in user should also see their posts on their newsfeed

      rawFollowings.map((following) => {
        followings.push(following.user_relationships_user_id);
      });

      const posts = await this._userFeedRepository.getFeed(pagination, followings);

      for (let i = 0; i < posts.length; i++) {
        try {
          posts[i].location_details = '';
          if (posts[i].posts_google_maps_place_id) {
            // Retrieve post location details
            const place = await this._googleapis.placeDetails({
              params: {
                place_id: posts[i].posts_google_maps_place_id,
                key: `${process.env.GOOGLE_MAPS_API_KEY}`
              }
            }).catch((error) => {
              throw error.stack;
            });
            posts[i].location_details = `${place.data.result.name}, ${place.data.result.vicinity}`;
          }
          posts[i].user = await this._userPool.getUser(posts[i].posts_user_id)
        } catch(e) {
          posts.splice(i, 1)
          continue;
        }
      }

      return res.status(200).json({
        message: 'Posts retrieved successfully',
        payload: posts,
        status: 200
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'An error occurred in retrieving posts',
        error: 'Internal server error',
        status: 500
      });
    }
  }

  /**
   * Retrieves feed for current trends.
   * @param req: Request
   * @returns res: Response
   */
   async getTrendingFeed(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.pagination) {
      return res.status(400).json({
        message: errors.pagination.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (!req.session.user) {
      return res.status(401).json({
      message: 'Please login and try again.',
      error: 'Unauthenticated',
      status: 401
      });
    }

    try {
      const { pagination } = req.body;
      const threshold = 20;
      const posts = await this._userFeedRepository.getTrendingFeed(pagination, threshold);
      for (let i = 0; i < posts.length; i++) {
        try {
          posts[i].location_details = '';
          if (posts[i].google_maps_place_id) {
            // Retrieve post location details
            const place = await this._googleapis.placeDetails({
              params: {
                place_id: posts[i].google_maps_place_id,
                key: `${process.env.GOOGLE_MAPS_API_KEY}`
              }
            }).catch((error) => {
              throw error.stack;
            });
            posts[i].location_details = `${place.data.result.name}, ${place.data.result.vicinity}`;
          }
          posts[i].user = await this._userPool.getUser(posts[i].user_id)
        } catch(e) {
          posts.splice(i, 1)
          continue;
        }
      }

      return res.status(200).json({
        message: 'Posts retrieved successfully',
        payload: posts,
        status: 200
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'An error occurred in retrieving posts',
        error: 'Internal server error',
        status: 500
      });
    }
  }
}

export default UserFeed;