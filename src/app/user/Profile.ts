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
      const accesstoken = req.headers.authorization?.split(' ')[1];
      const profile = await this._profile.getUserProfile(accesstoken || '');
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