import { getConnection } from 'typeorm';
import { Container } from 'typedi';
import infraUtils from '../utils/index';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

export type createParamsType = { email: string, password: string, account_status: string }
interface BaseRepositoryInterface {
  getItemById(id: string, entity: any, table: string): Promise<any>;
}

abstract class BaseRepository implements BaseRepositoryInterface {
  protected _log: any;

  constructor() {
    this._log = Container.get(infraUtils.Logger);
  }

  /**
   * Get a user by its id in the database table.
   * @param id string
   * @param entity any
   * @param table string
   * @returns Promise<any>
   */
  async getItemById(id: string, entity: any, table: string): Promise<any> {
    return await getConnection()
    .createQueryBuilder()
    .select(table)
    .from(entity, table)
    .where('id = :id', {id})
    .getOne()
    .catch((err) => {
      this._log.error({
        label: `${filePath} - getById()`,
        message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
        payload: {
          id,
          entity,
          table
        }
      });
      throw new Error('Database operation error');
    });
  }
}

export default BaseRepository;