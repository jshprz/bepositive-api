import infraAuthentication from "../../infra/authentication";
import { Container, Service } from 'typedi';
import { SignInInterface } from "../../interface/authentication/SignInInterface";
import { Request, Response } from 'express';
import { validationResult } from "express-validator";

@Service()
class Login {

  private _signIn: SignInInterface;

  constructor() {
    const container = Container.of();
    this._signIn = container.get(infraAuthentication.SignIn);
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

      res.status(200).send(signin);
    } catch (error: any) {
      res.status((error.code && error.code === 'NotAuthorizedException')? 401 : 500).json({
        message: (error.code && error.code === 'NotAuthorizedException')? error.message : 'Internal server error',
        error: (error.code && error.code === 'NotAuthorizedException')? 'Unauthorized' : 'Internal server error',
        status: (error.code && error.code === 'NotAuthorizedException')? 401 : 500
      });
    }
  }
}

export default Login;