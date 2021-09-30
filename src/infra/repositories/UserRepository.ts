import { Service } from 'typedi';
import 'reflect-metadata';
import { UserRepositoryInterface, createParamsType} from '../../interface/repositories/UserRepositoryInterface';
import BaseRepository from './BaseRepository';
import { Users } from '../../database/postgresql/models/Users';
import { getRepository, MoreThan } from 'typeorm';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);
@Service()
class UserRepository extends BaseRepository implements UserRepositoryInterface {

  constructor(
    private _usersEntity = new Users()
  ) {
    super();
  }

  /**
   * Calls a function in the BaseRepository to create a user record in the database table.
   * @param item { email: string, password: string, account_status: string }
   * @returns Promise<any>
   */
  async createUser(item: createParamsType): Promise<any> {
    return await this.create(item, this._usersEntity);
  }

  /**
   * Calls a function in the BaseRepository to update a user record in the database table.
   * @param id string
   * @param item {}
   * @returns Promise<any>
   */
  async updateUser(id: string, item: {}): Promise<any> {
    return await this.update(id, item, 'Users');
  }

  /**
   * Calls a function in the BaseRepository to get a user by its id in the database table.
   * @param id string
   * @returns Promise<any>
   */
  async getUserById(id: string): Promise<any> {
    return await this.getById(id, 'Users', 'users');
  }

  /**
   * Get a user by its email in the database table.
   * @param email string
   * @returns Promise<any>
   */
  async getUserByEmail(email: string): Promise<any> {
    return await getRepository(Users)
      .findOne({email})
      .catch((err) => {
        this._log.error({
          label: `${filePath} - getUserByEmail()`,
          message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
          payload: {
            email
          }
        });
        throw new Error('Database operation error');
      });
  }

  /**
   * Get a user by its reset token in the database table.
   * @param token string
   * @returns Promise<any>
   */
  async getUserByResetToken(token: string): Promise<any> {
    return await getRepository(Users).findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: MoreThan(Date.now())
      }
    })
    .catch((err) => {
      this._log.error({
        label: `${filePath} - getUserByResetToken()`,
        message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
        payload: {
          token
        }
      });
      throw new Error('Database operation error');
    });
  }
}

export default UserRepository;