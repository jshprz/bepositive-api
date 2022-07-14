import express from 'express';
import { getConnection } from './src/config/Database';
import { apis } from './src/routes';
import Logger from './src/config/Logger';

const logger = Logger.createLogger('Main');

const main = async () => {
  getConnection();
  const app = express();
  const port = process.env.PORT;

  app.use((req, res, next) => {
    res.header({
      "Access-Control-Allow-Origin": "https://main.bepositive-staging.smedia.com.au",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS,PUT,PATCH,DELETE"
    });
    next();
  });

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.end('Bepositive API');
  });

  app.use('/api/v1/auth', apis.AuthenticationApi);
  app.use('/api/v1/user', apis.UserApi);
  app.use('/api/v1/post', apis.PostApi);
  app.use('/api/v1/feed', apis.UserFeedApi);
  app.use('/api/v1/location', apis.LocationApi);
  app.use('/api/v1/comment', apis.CommentApi);
  app.use('/api/v1/search', apis.SearchApi);
  app.use('/api/v1/advertisement', apis.AdvertisementApi);

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
