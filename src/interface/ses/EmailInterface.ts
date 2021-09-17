export interface EmailInterface {

  sendResetPasswordEmail(recipient: string, subject: string, body: string): Promise<any>;

}