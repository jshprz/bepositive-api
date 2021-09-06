import express from 'express';
import { createConnection } from 'typeorm';
import { apis } from './src/routes/index';
import { utils } from './src/infra/utils';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

const logger = new utils.Logger();
const request = require("request");

const main = async () => {
  createConnection();
  const app = express();
  const port = (process.env.NODE_ENV === 'local')? 3000 : process.env.PORT;

  // auth0 authentication with JWT
  // const jwtCheck = jwt({
  //   secret: jwks.expressJwtSecret({
  //       cache: true,
  //       rateLimit: true,
  //       jwksRequestsPerMinute: 5,
  //       jwksUri: 'https://dev-uy5jvq8p.us.auth0.com/.well-known/jwks.json'
  //   }),
  //   audience: 'http://127.0.0.1:3000',
  //   issuer: 'https://dev-uy5jvq8p.us.auth0.com/',
  //   algorithms: ['RS256']
  // });

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());
  // app.use(jwtCheck);

  // retrieve access token
  // TO DO: set token in authorization header for future requests
  // const options = {
  //     method: 'POST',
  //     url: 'https://dev-uy5jvq8p.us.auth0.com/oauth/token',
  //     headers: { 'content-type': 'application/json' },
  //     body: '{"client_id":"j6mGyftrjBS4fa1qbjOSdhQFeUuvm3IG","client_secret":"PANXKyw5KkL3FZ2NwVj8qSgigYGsXywpMcIDAfPaBa7zZC136PW2VikO_t2VQOYL","audience":"http://127.0.0.1:3000","grant_type":"client_credentials"}'
  // };
  // request(options, async function (error: string, response: Response, body: string) {
  //     if (error) {
  //     throw new Error(error);
  //     } else {
  //       logger.info({
  //         label: 'index.js',
  //         message: body
  //       });
  //     }
  // });

  app.use('/rest/v1/auth', apis.AuthenticationApi);
  app.use('/rest/v1/user', apis.UserApi);

  app.listen(port, () => {
    logger.info({
      label: 'index.js - listen()',
      message: `Server started: ${port}`
    });
  });
}

main().catch(err => {
  logger.error({
    label: 'index.js',
    message: err
  });
});