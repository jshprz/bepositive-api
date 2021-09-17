import { Container, Service } from 'typedi';
import 'reflect-metadata';
import AwsSes from './AwsSes';
import { utils } from '../utils';
import path from 'path';
import { EmailInterface } from '../../interface/ses/EmailInterface';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);
@Service()
export class Email extends AwsSes implements EmailInterface {

  private _log: any;

  constructor() {
    super();

    this._log = Container.get(utils.Logger);
  }

  /**
   * Calls a function in the AwsSes and composes an email message and immediately queues it for sending.
   * @param recipient string
   * @param subject string
   * @param body string
   * @returns Promise<any>
   */
  async sendResetPasswordEmail(recipient: string, subject: string, body: string): Promise<any> {
    const recipients = [
      recipient
    ];
    return await this.sendEmail(recipients, subject, body)
      .catch((err) => {
        this._log.error({
          label: `${filePath} - sendResetPasswordEmail()`,
          message: err,
          payload: {
            recipient,
            subject,
            body
          }
        });
        throw new Error('Send email was failing');
      });
  }
}
