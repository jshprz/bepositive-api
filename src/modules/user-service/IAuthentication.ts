import { CognitoUserSession } from "amazon-cognito-identity-js";
import { Request } from "express";
import { InitiateAuthResponse } from "aws-sdk/clients/cognitoidentityserviceprovider";

interface IAuthentication {
    normalLogin(body: { email: string, password: string }): Promise<CognitoUserSession>;
    logout(req: Request): Promise<boolean>;
    createAccessTokenItem(accessToken: string, userCognitoSub: string): Promise<boolean>;
    deleteAccessTokenItem(userCognitoSub: string): Promise<boolean>;
    generateNewAccessToken(refreshToken: string): Promise<{ message: string, data: InitiateAuthResponse, code: number }>;
}

export default IAuthentication;