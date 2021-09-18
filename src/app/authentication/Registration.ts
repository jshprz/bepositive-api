import infraAuthentication from "../../infra/authentication/index";
import { Container, Service } from 'typedi';
import { SignUpInterface } from "../../interface/authentication/SignUpInterface";
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

@Service()
class Registration {
  private _signUp: SignUpInterface;

  constructor() {
    const container = Container.of();
    this._signUp = container.get(infraAuthentication.SignUp);
  }

  async register(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.username) {
      return res.status(400).json({
        message: errors.username.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (errors.name) {
      return res.status(400).json({
        message: errors.name.msg,
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
      const { username, email, name, password } = req.body;

      await this._signUp.doSignUp({
        username,
        email,
        name,
        password
      });

      res.status(200).json({
        message: `User successfully registered. The verification code has been sent to this email: ${email}`,
        payload: {},
        status: 200
      });
    } catch (error: any) {
      res.status((error.code && error.code === 'UsernameExistsException')? 409 : 500).json({
        message: (error.code && error.code === 'UsernameExistsException')? error.message : 'Internal server error',
        error: (error.code && error.code === 'UsernameExistsException')? 'Conflict' : 'Internal server error',
        status: (error.code && error.code === 'UsernameExistsException')? 409 : 500
      });
    }
  }

  async verify(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.username) {
      return res.status(400).json({
        message: errors.username.msg,
        error: 'bad request error',
        status: 400
      });
    }

    if (errors.verifyCode) {
      return res.status(400).json({
        message: errors.verifyCode.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const { username } = req.body;
      await this._signUp.verifyUser(req.body);
      await this._signUp.updateEmailVerifiedToTrue(username);
      res.status(200).json({
        message: 'verified successfully.',
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

export default Registration;