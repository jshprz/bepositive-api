import { createParamsType } from '../../interface/repositories/AccountInterface';
import { getConnection } from 'typeorm';
import { Users } from '../../database/models/Users';
import { parse } from 'querystring';
interface BaseRepositoryInterface {
  create(item: createParamsType, entity: any): Promise<boolean>;
  update(id: string, item: object, entity: any): Promise<any>;
  getById(id: string, entity: any, table: string): Promise<any>;
}

abstract class BaseRepository implements BaseRepositoryInterface {
  async create(item: createParamsType, entity: any) {

    entity.email = item.email;
    entity.password = item.password;
    entity.account_status = item.account_status;
    entity.created_at = Number(Date.now());

    return await entity.save().catch((err: any) => {
      console.log(`\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`);
      throw new Error('Database operation error');
    });
  }

  async update(id: string, item: object, entity: string) {
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
        console.log(`\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`);
        throw new Error('Database operation error');
      });
  }

  async getById(id: string, entity: any, table: string) {
    return await getConnection()
    .createQueryBuilder()
    .select(table)
    .from(entity, table)
    .where('id = :id', {id})
    .getOne()
    .catch((err) => {
      console.log(`\n error: Database operation error \n details: ${err.detail || err.message} \n query: ${err.query}`);
      throw new Error('Database operation error');
    });
  }
}

export default BaseRepository;