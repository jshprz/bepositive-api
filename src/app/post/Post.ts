import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import repositories from '../../infra/repositories';
import { Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import s3 from '../../infra/s3/index';
import { MediaInterface } from '../../interface/s3/MediaInterface';
import { config } from '../../config/index';
import uniqid from 'uniqid';

declare module 'express-session' {
  interface Session {
    accesstoken: string;
    user: {
      sub: string,
      name: string,
      email_verified: string,
      username: string,
      email: string
    };
  }
}

@Service()
class Post {
  private _postRepository: PostRepositoryInterface;
  private _s3: MediaInterface;

  constructor() {
    const container = Container.of();
    this._postRepository = container.get(repositories.PostRepository);
    this._s3 = container.get(s3.Media);
  }

  async createPost(req: Request, res: Response) {
    const errors: Record<string, ValidationError> = validationResult(req).mapped();

    if (errors.caption) {
      return res.status(400).json({
        message: errors.caption.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (errors.files) {
      return res.status(400).json({
        message: errors.files.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (!req.session.user) {
      return res.status(401).json({
        message: 'please login and try again.',
        error: 'unauthenticated',
        status: 401
      });
    }

    try {
      const userCognitoSub: string = req.session.user.sub;
      const { caption, files } = req.body;

      // We append which folder inside S3 bucket the file will be uploaded.
      // We make the filename unique.
      files.forEach((file) => {
        file.key = `${config.POST_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
      });

      const uploadSignedUrls = await this._s3.getPresignedUrlUpload(files);
      const createPost = await this._postRepository.create({userCognitoSub, caption, files});

      res.status(200).json({
        message: createPost,
        payload: uploadSignedUrls,
        status: 200
      });
    } catch (error) {
      res.status(500).json({
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

      res.status(200).json({
        message: 'posts successfully retrieved.',
        payload: postsAsPayloadResponse,
        status: 200
      });
    } catch (error) {
      res.status(500).json({
        message: error,
        error: 'Internal server error',
        status: 500
      });
    }
  }
}

export default Post;