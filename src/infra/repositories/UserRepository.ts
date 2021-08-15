import { Service } from 'typedi';
import 'reflect-metadata';
import { AccountInterface, createParamsType} from '../../interface/repositories/AccountInterface';
import BaseRepository from './BaseRepository';
import { Users } from '../../database/models/Users';

@Service()
export class UserRepository extends BaseRepository implements AccountInterface {

  constructor(
    private usersEntity = new Users()
  ) {
    super();
  }

  async createUser(item: createParamsType) {
    return await this.create(item, this.usersEntity);
  }

  async updateUser(id: string, item: {}) {
    return await this.update(id, item, 'Users');
  }
}