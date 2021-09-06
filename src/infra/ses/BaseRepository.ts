import AWS from 'aws-sdk';

abstract class BaseRepository {

  private _awsSes;

  constructor() {

    const SES_CONFIG = {
      region: 'ap-southeast-2'
    }

    this._awsSes = new AWS.SES(SES_CONFIG);

  }

  /**
   * Composes an email message and immediately queues it for sending.
   * @param recipientEmail any
   * @param subject string
   * @param body string
   * @returns Promise<any>
   */
  async sendEmail(recipientEmail: any, subject: string, body: string): Promise<any> {
    const params = {
      Source: `${process.env.EMAIL_DEFAULT_SENDER}`,
      Destination: {
        ToAddresses: recipientEmail
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    };

    return this._awsSes.sendEmail(params).promise();
  }

  /**
   * Composes an email message using an email template and immediately queues it for sending.
   * @param recipientEmail any
   * @param templateName string
   * @param templateData string
   * @returns Promise<any>
   */
  async sendTemplateEmail (recipientEmail: any, templateName: string, templateData: string): Promise<any> {
    const params = {
      Source: `${process.env.EMAIL_DEFAULT_SENDER}`,
      Template: templateName,
      Destination: {
        ToAddresses: recipientEmail
      },
      TemplateData: templateData
    };

    return await this._awsSes.sendTemplatedEmail(params);
  }
}

export default BaseRepository;