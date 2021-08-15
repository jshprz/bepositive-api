import { Container } from "typedi";
import { UserRepository } from "../../infra/repositories/UserRepository";
import 'reflect-metadata';

describe('Integrate test UserRepository', () => {
  test('should register a user', async () => {
    const getUserRepository = Container.get(UserRepository);
    const data = {
      email: 'a@gmail.com',
      password: 'lala',
      account_status: 'not verified'
    };
    const registerUser = await getUserRepository.createUser(data);
    expect(registerUser).toBe('hello');
  });
});