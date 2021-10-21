import infraAuthentication from "../../infra/cognito/index";
import { Container, Service } from 'typedi';
import { SignUpInterface } from "../../interface/cognito/SignUpInterface";
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import 'reflect-metadata';

@Service()
class Registration {
  private _signUp: SignUpInterface;

  constructor() {
    const container = Container.of();
    this._signUp = container.get(infraAuthentication.SignUp);
  }

  async register(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.name) {
      return res.status(400).json({
        message: errors.name.msg,
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
      const { email, name, password } = req.body;

      await this._signUp.doSignUp({
        email,
        name,
        password
      });

      return res.status(200).json({
        message: `User successfully registered. The verification code has been sent to this email: ${email}`,
        payload: {},
        status: 200
      });
    } catch (error: any) {
      return res.status((error.code && error.code === 'UsernameExistsException')? 409 : 500).json({
        message: (error.code && error.code === 'UsernameExistsException')? error.message : error,
        error: (error.code && error.code === 'UsernameExistsException')? 'Conflict' : 'Internal server error',
        status: (error.code && error.code === 'UsernameExistsException')? 409 : 500
      });
    }
  }

  async verify(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    if (errors.verifyCode) {
      return res.status(400).json({
        message: errors.verifyCode.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    try {
      const { email } = req.body;
      await this._signUp.verifyUser(req.body);
      await this._signUp.updateEmailVerifiedToTrue(email);

      return res.status(200).json({
        message: 'Verified successfully.',
        payload: {},
        status: 200
      });
    } catch (error: any) {

      const response = {
        message: '',
        error: '',
        status: 500
      }

      if (error.code && error.code === 'CodeMismatchException') {

        response.message = error.message;
        response.error = 'CodeMismatchException';
        response.status = 409;

      } else if (error.code && error.code === 'ExpiredCodeException') {

        response.message = 'Verification code has already been expired.';
        response.error = 'ExpiredCodeException';
        response.status = 410;

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
}

export default Registration;