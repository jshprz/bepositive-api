import CognitoExpress from 'cognito-express';
import { AccessTokens } from '../database/postgresql/models/AccessTokens';
import { getRepository } from 'typeorm';

export = async (req: any, res: any, next: any) => {
  const cognitoExpress = new CognitoExpress({
    region: process.env.AWS_REGION,
    cognitoUserPoolId: process.env.AWS_COGNITO_POOL_ID,
    tokenUse: 'access',
    tokenExpiration: 3600
  });

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1];
    const accesstoken = await getRepository(AccessTokens).find({ accesstoken: token });

    // Check the validity of the provided accesstoken by checking existence of the access token within the accesstokens table.
    if (accesstoken.length > 0) {
      // Check the validity of the access token via aws cognito.
      cognitoExpress.validate(token, (error: any, result: any) => {
        if (error) {
          res.status(401).json({
            message: error,
            error: 'Authorization failed',
            status: 401
          });
        } else {
          next();
        }
      });
    } else {
      res.status(401).send('Invalid provided access token.');
    }
  } else {
    res.status(401).send('No access token provided');
  }
};