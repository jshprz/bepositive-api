import { Container, Service } from 'typedi';
import { repositories } from '../../infra/repositories';
import { ses } from '../../infra/ses';
import { UserRepository } from '../../infra/repositories/UserRepository';
import { EmailInterface } from '../../interface/ses/EmailInterface';
import { Request, Response } from 'express';
import 'reflect-metadata';
import crypto from 'crypto';
import resetPasswordEmailTemplate from '../../templates/ResetPasswordEmailTemplate';
import { validationResult } from 'express-validator';
@Service()
class ForgotPassword {
  private _userRepository: UserRepository;
  private _awsSes: EmailInterface;

  constructor() {
    const container = Container.of();
    this._userRepository = container.get(repositories.UserRepository);
    this._awsSes = container.get(ses.Email);
  }

  async requestResetPasswordViaEmail(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.email) {
      return res.status(400).json({
        message: errors.email.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const cryptoBuffer = await crypto.randomBytes(32);
      const token = cryptoBuffer.toString('hex');
      const tokenExpiration = Date.now() + 3600000; // +1hr

      const userEmail = await this._userRepository.getUserByEmail(req.body.email);

      if (!userEmail) {
        return res.status(404).json({
          message: 'email provided does not exist.',
          error: 'resource not found',
          status: 404
        });
      }

      await this._userRepository.updateUser(userEmail.id, {
        resetToken: token,
        resetTokenExpiration: tokenExpiration
      });

      const subject = 'Bepositive Reset Password';
      const body = resetPasswordEmailTemplate(token);

      await this._awsSes.sendResetPasswordEmail(userEmail.email, subject, body);

      res.status(200).json({
        message: 'reset password token successfully sent to the email.',
        payload: {},
        status: 200
      });

    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: 'Internal server error',
        status: 500
      });
    }
  }

  async verifyResetToken(req: Request, res: Response) {
    const errors = validationResult(req).mapped();

    if (errors.token) {
      return res.status(400).json({
        message: errors.token.msg,
        error: 'bad request error',
        status: 400
      });
    }

    try {
      const tokenValidity = await this._userRepository.getUserByResetToken(req.params.token);

      if (!tokenValidity) {
        return res.status(403).json({
          message: 'reset password token is not valid.',
          error: 'forbidden client error',
          status: 403
        });
      }

      return res.status(200).json({
        message: 'reset token is valid.',
        payload: {
          token: tokenValidity.resetToken
        },
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

    if (errors.token) {
      return res.status(400).json({
        message: errors.token.msg,
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
      const tokenValidity = await this._userRepository.getUserByResetToken(req.params.token);

      if (!tokenValidity) {
        return res.status(403).json({
          message: 'reset password token is not valid.',
          error: 'forbidden client error',
          status: 403
        });
      }

      const body = {
        password: req.body.password
      }
      await this._userRepository.updateUser(tokenValidity.id, body);

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

export default ForgotPassword;