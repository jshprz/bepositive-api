import express from 'express';
import { createConnection } from 'typeorm';
import { apis } from './src/routes/index';

const main = async () => {
  createConnection();
  const app = express();
  const port = 3000;

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

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