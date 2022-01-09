import express from 'express';
import { getConnection } from './src/config/Database';
import { apis } from './src/routes';
import Logger from './src/config/Logger';
import session from 'express-session';
import multer from 'multer';

const logger = Logger.createLogger('Main');

const main = async () => {
  getConnection();
  const app = express();
  const port = process.env.PORT;

  if (process.env.NODE_ENV === 'local') {
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));
  } else {
    app.use(session({
      secret: 'keyboard cat'
    }));
  }

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());
  app.use(multer().any());

  app.get('/', (req, res) => {
    res.end('Bepositive API');
  });

  app.use('/api/v1/auth', apis.AuthenticationApi);
  app.use('/api/v1/user', apis.UserApi);
  app.use('/api/v1/post', apis.PostApi);
  app.use('/api/v1/feed', apis.UserFeedApi);
  app.use('/api/v1/location', apis.LocationApi);
  app.use('/api/v1/comment', apis.CommentApi);

  app.listen(port, () => {
    logger.info({
      message: `Server started: ${port}`,
      payload: {}
    });
  });
}

main().catch(err => {
  logger.error({
    message: err,
    payload: {}
  });
});
