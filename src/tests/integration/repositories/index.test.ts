import { Connection } from "typeorm";
import { getConnection, closeConnection } from "../../../config/database";
import repositories from '../../../infra/repositories/index';
import 'reflect-metadata';
import { Container } from 'typedi';

let connection: Connection;

beforeAll(async () => {
  connection = await getConnection();
});
beforeEach(async () => {
  await connection.synchronize(true);
});
it('should create a connection', () => {
  expect(connection).toBeDefined();
});

it('should create a post data in posts table postgresql', async () => {

  const postRepositoryContainer = Container.get(repositories.PostRepository);

  const item = {
    userCognitoSub: 'test cognito sub',
    caption: 'test caption',
    files: [
      {
        key: 'test s3 file key',
        type: 'test file type'
      }
    ]
  };

  await expect(postRepositoryContainer.create(item)).resolves.toEqual('post successfully created.');
});

afterAll(async () => await closeConnection());