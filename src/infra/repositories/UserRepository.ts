import { Service } from 'typedi';
import 'reflect-metadata';
import { AccountInterface, createParamsType} from '../../interface/repositories/AccountInterface';
import BaseRepository from './BaseRepository';
import { Users } from '../../database/models/Users';
import { getRepository, MoreThan } from 'typeorm';

@Service()
export class UserRepository extends BaseRepository implements AccountInterface {

  constructor(
    private _usersEntity = new Users()
  ) {
    super();
  }

  async createUser(item: createParamsType) {
    return await this.create(item, this._usersEntity);
  }

  async updateUser(id: string, item: {}) {
    return await this.update(id, item, 'Users');
  }

  async getUserById(id: string) {
    return await this.getById(id, 'Users', 'users');
  }

  async getUserByEmail(email: string) {
    return await getRepository(Users)
      .findOne({email})
      .catch((err) => {
        console.log(`\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`);
        throw new Error('Database operation error');
      });
  }

  async getUserByResetToken(token: string) {
    return await getRepository(Users).findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: MoreThan(Date.now())
      }
    })
    .catch((err) => {
      console.log(`\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`);
      throw new Error('Database operation error');
    });
  }
}