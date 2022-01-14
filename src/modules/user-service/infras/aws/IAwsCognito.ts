import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import AWS from "aws-sdk";

interface  IAwsCognito {
    userPool(): CognitoUserPool;
    cognitoUserAttributeList(email: string, name: string): CognitoUserAttribute[];
    getCognitoUser(email: string): CognitoUser;
    getAuthenticationDetails(body: {email: string, password: string}): AuthenticationDetails;
    getAwsCognitoClient(): AWS.CognitoIdentityServiceProvider;
}

export default IAwsCognito;