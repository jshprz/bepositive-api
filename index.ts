import express from 'express';
import { getConnection } from './src/config/database';
import { apis } from './src/routes/index';
import infraUtils from './src/infra/utils';
import session from 'express-session';

const logger = new infraUtils.Logger();

const main = async () => {
  getConnection();
  const app = express();
  const port = process.env.PORT;

  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: (process.env.NODE_ENV === 'local')? false : true }
  }));

  if (process.env.NODE_ENV !== 'local') {
    app.use((req, res, next) => {
      app.set('trust proxy', 1); // Trust first proxy
    });
  }

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.end('Bepositive API');
  });

  app.use('/rest/v1/auth', apis.AuthenticationApi);
  app.use('/rest/v1/user', apis.UserApi);
  app.use('/rest/v1/post', apis.PostApi);

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