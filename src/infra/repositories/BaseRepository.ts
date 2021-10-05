import { getConnection } from 'typeorm';
import { Container } from 'typedi';
import infraUtils from '../utils/index';
import path from 'path';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

export type createParamsType = { email: string, password: string, account_status: string }
interface BaseRepositoryInterface {
  create(item: createParamsType, entity: any): Promise<boolean>;
  update(id: string, item: object, entity: any): Promise<any>;
  getById(id: string, entity: any, table: string): Promise<any>;
}

abstract class BaseRepository implements BaseRepositoryInterface {
  protected _log: any;

  constructor() {
    this._log = Container.get(infraUtils.Logger);
  }

  /**
   * Creates user record in the database table.
   * @param item { email: string, password: string, account_status: string }
   * @param entity any
   * @returns Promise<any>
   */
  async create(item: createParamsType, entity: any): Promise<any> {

    entity.email = item.email;
    entity.password = item.password;
    entity.account_status = item.account_status;
    entity.created_at = Number(Date.now());

    return await entity.save().catch((err: any) => {
      this._log.error({
        label: `${filePath} - create()`,
        message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
        payload: {
          item,
          entity
        }
      });
      throw new Error('Database operation error');
    });
  }

  /**
   * Updates user record in the database table.
   * @param id string
   * @param item object
   * @param entity string
   * @returns Promise<any>
   */
  async update(id: string, item: object, entity: string): Promise<any> {
    const modifiedItem = {
      ...item,
      updated_at: Number(Date.now())
    }
    return await getConnection()
      .createQueryBuilder()
      .update(entity)
      .set(modifiedItem)
      .where('id = :id', {id})
      .execute()
      .catch((err) => {
        this._log.error({
          label: `${filePath} - update()`,
          message: `\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`,
          payload: {
            id,
            item,
            entity
          }
        });

        throw new Error('Database operation error');
      });
  }

  /**
   * Get a user by its id in the database table.
   * @param id string
   * @param entity any
   * @param table string
   * @returns Promise<any>
   */
  async getById(id: string, entity: any, table: string): Promise<any> {
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