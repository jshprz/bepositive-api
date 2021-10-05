import cognito from '../../infra/cognito/index';
import { Container, Service } from 'typedi';
import 'reflect-metadata';
import { UserPoolInterface } from '../../interface/cognito/UserPoolInterface';
import { Request, Response } from 'express';

@Service()
class Profile {
  private _profile: UserPoolInterface;

  constructor() {
    const container = Container.of();
    this._profile = container.get(cognito.UserPool)
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      if (!req.session.accesstoken) {
        return res.status(401).json({
          message: 'Unauthorized request',
          error: 'Unauthorized',
          status: 401
        });
      }

      const profile = await this._profile.getUserProfile(req.session.accesstoken);
      return res.status(200).send(profile);
    } catch (error: any) {

      return res.status(500).json({
        message: 'Internal server error',
        error,
        status: 500
      });
    }
  }
}

export default Profile;