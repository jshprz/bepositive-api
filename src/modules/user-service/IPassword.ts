interface IPassword {

    forgotPassword(email: string): Promise<string>;
    resetPassword(body: { email: string, verifyCode: string, newPassword: string }): Promise<string>;
}

export default IPassword;