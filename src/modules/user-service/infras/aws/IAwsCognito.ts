import { CognitoUserPool } from 'amazon-cognito-identity-js';

interface  IAwsCognito {
    userPool(): CognitoUserPool;
    cognitoUserAttributeList(email: string, name: string): any[];
    getCognitoUser(email: string);
    getAuthenticationDetails(body: {email: string, password: string});
    getAwsCognitoClient();
}

export default IAwsCognito;