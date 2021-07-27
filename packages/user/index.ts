import 'reflect-metadata';

import express from 'express';
import Container from 'typedi';
import TestController from './src/controllers/TestController';
import { createConnection } from 'typeorm';
import usersApi from './src/routes/api';

const main = async () => {
  createConnection();
  const app = express();
  const port = 3000;

  const testController = Container.get(TestController);

  app.use('/user', usersApi);
  app.get('/users', (req, res) => testController.getAllUsers(req, res));

  app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server started: ${port}`);
  });
}

main().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
});