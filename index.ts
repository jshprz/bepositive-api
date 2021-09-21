import express from 'express';
import { createConnection } from 'typeorm';
import { apis } from './src/routes/index';
import infraUtils from './src/infra/utils';

const logger = new infraUtils.Logger();

const main = async () => {
  createConnection();
  const app = express();
  const port = (process.env.NODE_ENV === 'local')? 3000 : process.env.PORT;

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

  app.use('/', (req, res) => {
    const text = `<center>Bepositive API</center>`;
    res.send(text);
  });
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