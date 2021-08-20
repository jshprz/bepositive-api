import { Service, Container } from 'typedi';
import { repositories } from '../../infra/repositories/index';
import { Request, Response } from 'express';
import { AccountInterface } from '../../interface/repositories/AccountInterface';
import 'reflect-metadata';

@Service()
class Account {

  private _userRepository: AccountInterface;

  constructor() {
    const container = Container.of();
    this._userRepository = container.get(repositories.UserRepository);
  }

  async registerUser(req: Request, res: Response) {
    try {
      const createUser = await this._userRepository.createUser(req.body);
      if (!createUser) {
        return res.status(500).send('Internal Server Error');
      }

      return res.status(200).send('User successfully registered.');

    } catch(error) {
      return res.status(500).end(error);
    }
  }

  async updateUser(req: Request, res: Response) {

      const updateUser = await this._userRepository.updateUser(req.body.id, req.body);
      if (!updateUser) {
        return res.status(500).send('Internal Server Error');
      }

      return res.status(200).send('User updated successfully.');

  }
}

export default Account;