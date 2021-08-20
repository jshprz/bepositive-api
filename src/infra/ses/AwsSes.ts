import { Service } from 'typedi';
import 'reflect-metadata';
import BaseRepository from './BaseRepository';

@Service()
export class AwsSes extends BaseRepository {

  constructor() {
    super();
  }

  async sendResetPasswordEmail(recipient: string, subject: string, body: string) {
    const recipients = [
      recipient
    ];
    return await this.sendEmail(recipients, subject, body)
      .catch((err) => {
        console.log(`error: ${err}`);
        throw new Error('Send email was failing');
      });
  }
}
