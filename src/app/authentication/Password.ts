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

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    try {
      const { email } = req.body;
      await this._resetPassword.forgotPassword(email);

      return res.status(200).json({
        message: `Reset password token successfully sent to this email: ${email}`,
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

  async resetPassword(req: Request, res: Response) {
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

    if (errors.newPassword) {
      return res.status(400).json({
        message: errors.newPassword.msg,
        error: 'Bad request error',
        status: 400
      });
    }

    try {
      await this._resetPassword.resetPassword(req.body);
      return res.status(200).json({
        message: 'Password reset successfully',
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

export default Password;