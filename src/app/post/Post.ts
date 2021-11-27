import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import { UserRelationshipRepositoryInterface } from '../../interface/repositories/UserRelationshipRepositoryInterface';
import { UserFeedRepositoryInterface } from '../../interface/repositories/UserFeedRepositoryInterface';
import repositories from '../../infra/repositories';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import s3 from '../../infra/s3/index';
import { MediaInterface } from '../../interface/s3/MediaInterface';
import { config } from '../../config';
import uniqid from 'uniqid';
import '../../interface/declare/express-session';
import { Client } from '@googlemaps/google-maps-services-js';
@Service()
class Post {
  private _postRepository: PostRepositoryInterface;
  private _s3: MediaInterface;
  private _userRelationshipRepository: UserRelationshipRepositoryInterface;
  private _userFeedRepository: UserFeedRepositoryInterface;
  private _googleapis: Client;

  constructor() {
    const container = Container.of();
    this._postRepository = container.get(repositories.PostRepository);
    this._s3 = container.get(s3.Media);
    this._userRelationshipRepository = container.get(repositories.UserRelationshipRepository);
    this._userFeedRepository = container.get(repositories.UserFeedRepository);
    this._googleapis = new Client({});
  }

  async createPost(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.caption) {
      return res.status(400).json({
        message: errors.caption.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.files) {
      return res.status(400).json({
        message: errors.files.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.googlemapsPlaceId) {
      return res.status(400).json({
        message: errors.google_maps_place_id.msg,
        error: 'Bad request error',
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
      const { caption, files, googlemapsPlaceId } = req.body;

      // We append which folder inside S3 bucket the file will be uploaded.
      // We make the filename unique.
      files.forEach((file) => {
        file.key = `${config.POST_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
      });

      const uploadSignedUrls = await this._s3.getPresignedUrlUpload(files);
      const postId = await this._postRepository.create({userCognitoSub, caption, files, googlemapsPlaceId});
      const followers = await this._userRelationshipRepository.getFollowers(userCognitoSub);

      Promise.all(
        followers.map(async (follower) => {
          const userId = follower.user_relationships_user_id;
          return await this._userFeedRepository.createFeed(userId, postId);
        })
      ).then(() => {

        return res.status(200).json({
          message: 'Post created successfully.',
          payload: {
            upload_signed_urls: uploadSignedUrls,
          },
          status: 200
        });
      }).catch((error) => {

        return res.status(500).json({
          message: error,
          error: 'Internal server error',
          status: 500
        });
      });
    } catch (error) {
      return res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }

  async getPostsByUser(req: Request, res: Response) {

    if (!req.session.user) {
      return res.status(401).json({
        message: 'please login and try again.',
        error: 'Unauthenticated',
        status: 401
      });
    }

    try {
      const userCognitoSub: string = req.session.user.sub;

      const posts = await this._postRepository.getPostsByUserCognitoSub(userCognitoSub);

      const postsAsPayloadResponse = posts.map((post) => {
        const { posts_id, posts_s3_files } = post;

        posts_s3_files[0].key = `${process.env.AWS_S3_BUCKET_URL}/${posts_s3_files[0].key}`; // S3 object file URL.

        return {
          id: posts_id,
          post_media_file: posts_s3_files[0]
        };
      });

      return res.status(200).json({
        message: 'Posts successfully retrieved',
        payload: {
          posts: postsAsPayloadResponse
        },
        status: 200
      });
    } catch (error) {
      return res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }

  async getPostById(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.id) {
      return res.status(400).json({
        message: errors.id.msg,
        error: 'Bad request error',
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
      const post = await this._postRepository.getPostById(Number(req.params.id));

      if (post?.google_maps_place_id) {
        // Retrieve post location details
        const place = await this._googleapis.placeDetails({
          params: {
            place_id: post.google_maps_place_id,
            key: `${process.env.GOOGLE_MAPS_API_KEY}`
          }
        }).catch((error) => {
          throw error.stack;
        });
        post.location_details = `${place.data.result.name}, ${place.data.result.vicinity}`;
      }

      if (post?.s3_files) {
        post.s3_files.forEach((file) => {
          file.key = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
        });
      }

      return res.status(200).json({
        message: 'Post retrieved',
        payload: {
          post: post
        },
        status: 200
      });
    } catch (error: any) {

      return res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }

  async updatePost(req: Request, res: Response) {

    const errors = validationResult(req).mapped();

    if (errors.id) {
      return res.status(400).json({
        message: errors.id.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.caption) {
      return res.status(400).json({
        message: errors.caption.msg,
        error: 'Bad request error',
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

      const post = await this._postRepository.getPostById(Number(req.params.id));

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.',
          error: 'Not found.',
          status: 404
        });
      }

      await this._postRepository.updatePost(Number(req.params.id), req.body.caption);

      return res.status(200).json({
        message: 'The post was updated successfully.',
        payload: {},
        status: 200
      });

    } catch (error) {

      return res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }

  async removePost(req: Request, res: Response) {

    const errors = validationResult(req).mapped();

    if (errors.id) {
      return res.status(400).json({
        message: errors.id.msg,
        error: 'Bad request error',
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

      await this._postRepository.removePostById(Number(req.params.id));

      return res.status(200).json({
        message: 'The post was successfully deleted.',
        payload: {},
        status: 200
      });

    } catch (error) {

      return res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }
}

export default Post;