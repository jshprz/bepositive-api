import infraAuthentication from "../../infra/cognito";
import { Container, Service } from 'typedi';
import 'reflect-metadata';
import { SignInInterface } from "../../interface/cognito/SignInInterface";
import { AccessTokenRepositoryInterface } from "../../interface/repositories/AccessTokenRepositoryInterface";
import { Request, Response } from 'express';
import { validationResult } from "express-validator";
import repositories from '../../infra/repositories/index';

// Declaration merging on express-session
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
class Login {

  private _signIn: SignInInterface;
  private _accessTokenRepository: AccessTokenRepositoryInterface;

  constructor() {
    const container = Container.of();
    this._signIn = container.get(infraAuthentication.SignIn);
    this._accessTokenRepository = container.get(repositories.AccessTokenRepository);
  }

  async normalLogin(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.emailOrUsername) {
      return res.status(400).json({
        message: errors.emailOrUsername.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (errors.password) {
      return res.status(400).json({
        message: errors.password.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const signin = await this._signIn.doSignIn(req.body);
      const accesstoken: string = signin.accessToken.jwtToken;
      const { sub, name, email_verified, email } = signin.idToken.payload;

      // Creates accesstoken record within the accesstokens table.
      await this._accessTokenRepository.createAccessTokenItem(accesstoken, email);

      req.session.user = {
        sub,
        name,
        email_verified,
        username: signin.idToken.payload['cognito:username'],
        email
      }
      req.session.accesstoken = accesstoken;
      res.status(200).send(signin);
    } catch (error: any) {
      res.status((error.code && error.code === 'NotAuthorizedException')? 401 : 500).json({
        message: (error.code && error.code === 'NotAuthorizedException')? error.message : 'Internal server error',
        error: (error.code && error.code === 'NotAuthorizedException')? 'Unauthorized' : 'Internal server error',
        status: (error.code && error.code === 'NotAuthorizedException')? 401 : 500
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { email } = req.session.user;

      await this._signIn.doSignOut(req.session);
      await this._accessTokenRepository.deleteAccessTokenItem(email);

      res.status(200).json({
        message: 'user successfully logged out',
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

export default Login;