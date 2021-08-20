import AWS from 'aws-sdk';

abstract class BaseRepository {

  private _awsSes;

  constructor() {

    const SES_CONFIG = {
      region: 'ap-southeast-2',
      accessKeyId: process.env.SES_ACCESS_KEY,
      secretAccessKey: process.env.SES_ACCESS_KEY,
    }

    this._awsSes = new AWS.SES(SES_CONFIG);

  }

  async sendEmail(recipientEmail: any, subject: string, body: string) {
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

  async sendTemplateEmail (recipientEmail: any, templateName: string, templateData: string) {
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