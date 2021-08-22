import express from 'express';
import { createConnection } from 'typeorm';
import { apis } from './src/routes/index';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
const request = require("request");

const main = async () => {
  createConnection();
  const app = express();
  const port = 3000;

  // auth0 authentication with JWT
  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-uy5jvq8p.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'http://127.0.0.1:3000',
    issuer: 'https://dev-uy5jvq8p.us.auth0.com/',
    algorithms: ['RS256']
  });

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());
  app.use(jwtCheck);

  // retrieve access token
  // TO DO: set token in authorization header for future requests
  const options = {
      method: 'POST',
      url: 'https://dev-uy5jvq8p.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      body: '{"client_id":"j6mGyftrjBS4fa1qbjOSdhQFeUuvm3IG","client_secret":"PANXKyw5KkL3FZ2NwVj8qSgigYGsXywpMcIDAfPaBa7zZC136PW2VikO_t2VQOYL","audience":"http://127.0.0.1:3000","grant_type":"client_credentials"}'
  };
  request(options, async function (error: string, response: Response, body: string) {
      if (error) {
      throw new Error(error);
      } else {
        console.log(body);
      }
  });

  app.use('/rest/v1/auth', apis.AuthenticationApi);
  app.use('/rest/v1/user', apis.UserApi);

  app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server started: ${port}`);
  });
}

main().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
});