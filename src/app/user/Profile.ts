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
      const accessToken = req.headers.authorization?.split(' ')[1];
      const profile = await this._profile.getUserProfile(accessToken || '');
      const userProfile:any | {} = {
        username: profile.Username
      }
      profile.UserAttributes.forEach(attr => {
        userProfile[attr['Name']] = attr['Value'];
      });

      return res.status(200).json({
        message: 'User profile successfully retrieved',
        payload: {
          profile: userProfile
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
}

export default Profile;