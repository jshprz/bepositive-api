import { createParamsType } from '../../interface/repositories/AccountInterface';
import { getConnection } from 'typeorm';

interface BaseRepositoryInterface {
  create(item: createParamsType, entity: any): Promise<boolean>;
  update(id: string, item: object, entity: any): Promise<any>;
  // deleteById(id: string, entity: object): Promise<boolean>;
  // getById(id: string, entity: object): Promise<[]>
}

abstract class BaseRepository implements BaseRepositoryInterface {
  async create(item: createParamsType, entity: any) {

    entity.email = item.email;
    entity.password = item.password;
    entity.account_status = item.account_status;
    entity.created_at = new Date;

    return await entity.save().catch((err: any) => {
      console.log(JSON.stringify({
        error: 'Database operation error',
        details: err.detail,
        query: err.query
      }));
      return false;
    });
  }

  async update(id: string, item: {}, entity: string) {
    return await getConnection()
      .createQueryBuilder()
      .update(entity)
      .set(item)
      .where('id = :id', {id})
      .execute()
      .catch((err) => {
        console.log(JSON.stringify({
          error: 'Database operation error',
          details: err.detail,
          query: err.query
        }));

        return false;
      });
  }
  // deleteById(id: string, entity: T) {

  // }
  // getById(id: string, entity: T) {

  // }
}

export default BaseRepository;