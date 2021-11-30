import infraAuthentication from "../../infra/cognito";
import { Container, Service } from 'typedi';
import 'reflect-metadata';
import { SignInInterface } from "../../interface/cognito/SignInInterface";
import { AccessTokenRepositoryInterface } from "../../interface/repositories/AccessTokenRepositoryInterface";
import { Request, Response } from 'express';
import { validationResult } from "express-validator";
import repositories from '../../infra/repositories/index';
import '../../interface/declare/express-session';

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

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.password) {
      return res.status(400).json({
        message: errors.password.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    try {
      const signin = await this._signIn.doSignIn(req.body);
      const accessToken: string = signin.accessToken.jwtToken;
      const { sub, name, email_verified, email } = signin.idToken.payload;

      // Creates accessToken record within the access_tokens table.
      await this._accessTokenRepository.createAccessTokenItem(accessToken, email);

      req.session.user = {
        sub,
        name,
        email_verified,
        email
      }
      req.session.accessToken = accessToken;
      return res.status(200).json({
        message: 'Successfully logged in',
        payload: {
          accessToken: signin.accessToken.jwtToken
        },
        status: 200
      });
    } catch (error: any) {

      const response = {
        message: '',
        error: '',
        status: 500
      }

      if (error.code && error.code === 'NotAuthorizedException') {

        response.message = error.message;
        response.error = 'Unauthorized';
        response.status = 401;

      } else if (error.code && error.code === 'UserNotConfirmedException') {

        response.message = error.message;
        response.error = 'Forbidden';
        response.status = 403;

      } else {

        response.message = error;
        response.error = 'Internal server error';
        response.status = 500;

      }

      return res.status(response.status).json({
        message: response.message.toString(),
        error: response.error,
        status: response.status
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { email } = req.session.user;

      await this._signIn.doSignOut(req);
      await this._accessTokenRepository.deleteAccessTokenItem(email);

      return res.status(200).json({
        message: 'User successfully logged out',
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

export default Login;