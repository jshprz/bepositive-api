import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { PostRepositoryInterface } from '../../interface/repositories/PostRepositoryInterface';
import repositories from '../../infra/repositories';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

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

  constructor() {
    const container = Container.of();
    this._postRepository = container.get(repositories.PostRepository);
  }

  async createPost(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.caption) {
      return res.status(400).json({
        message: errors.caption.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const userCognitoSub: string = req.session.user.sub;
      const { caption } = req.body;

      // Temporary S3 files. This will be changed in the next task card.
      const s3Files = [
        {
          key: 'file key 1',
          type: 'image'
        }
      ];

      const createPost = await this._postRepository.create({userCognitoSub, caption, s3Files});

      res.status(200).json({
        message: createPost,
        payload: {},
        status: 200
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'Internal server error',
        error: 'Internal server error',
        status: 500
      });
    }
  }
}

export default Post;