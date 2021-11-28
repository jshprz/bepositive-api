export {};
// Declaration merging on amazon-cognito-identity-js
declare module 'amazon-cognito-identity-js' {
  interface CognitoUserSession {
    idToken: {
      jwtToken: string,
      payload: {
        'sub': string,
        'email_verified': boolean,
        'iss': string,
        'cognito:username': string,
        'origin_jti': string,
        'aud': string,
        'event_id': string,
        'token_use': string,
        'auth_time': number,
        'name': string,
        'exp': number,
        'iat': number,
        'jti': string,
        'email': string
      }
    },
    'refreshToken': {
      'token': string
    },
    // @ts-ignore
    "accesstoken": {
      'jwtToken': string,
      'payload': {
        'origin_jti': string,
        'sub': string,
        'event_id': string,
        'token_use': string,
        'scope': string,
        'auth_time': number,
        'iss': string,
        'exp': number,
        'iat': number,
        'jti': string,
        'client_id': string,
        'username': string
      }
    },
    'clockDrift': number
  }
}