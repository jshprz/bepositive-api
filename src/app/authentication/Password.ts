import { Container, Service } from 'typedi';
import { ResetPasswordInterface } from '../../interface/cognito/ResetPasswordInterface';
import { Request, Response } from 'express';
import 'reflect-metadata';
import { validationResult } from 'express-validator';
import infraAuthentication from "../../infra/cognito/index";

@Service()
class Password {
  private _resetPassword: ResetPasswordInterface;

  constructor() {
    const container = Container.of();
    this._resetPassword = container.get(infraAuthentication.ResetPassword);
  }

  async forgotPassword(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.emailOrUsername) {
      return res.status(400).json({
        message: errors.emailOrUsername.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const { emailOrUsername } = req.body;
      await this._resetPassword.forgotPassword(emailOrUsername);

      res.status(200).json({
        message: 'reset password token successfully sent to the email.',
        payload: {},
        status: 200
      });
    } catch (error) {
      res.status(500).json({
        message: 'internal server error',
        error: 'internal server error',
        status: 500
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.emailOrUsername) {
      return res.status(400).json({
        message: errors.emailOrUsername.msg,
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

    if (errors.newPassword) {
      return res.status(400).json({
        message: errors.newPassword.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      await this._resetPassword.resetPassword(req.body);
      return res.status(200).json({
        message: 'password reset successfully.',
        payload: {},
        status: 200
      });
    } catch (error) {
      res.status(500).json({
        message: 'internal server error',
        error: 'internal server error',
        status: 500
      });
    }
  }
}

export default Password;