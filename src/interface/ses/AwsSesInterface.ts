export interface AwsSesInterface {

  sendResetPasswordEmail(recipient: string, subject: string, body: string): Promise<any>;

}