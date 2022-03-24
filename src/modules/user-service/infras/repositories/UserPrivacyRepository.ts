import {getRepository, QueryFailedError, UpdateResult} from 'typeorm';
import { UserPrivacy } from "../../../../database/postgresql/models/UserPrivacy";
import IUserPrivacyRepository from "./IUserPrivacyRepository";


class UserPrivacyRepository implements IUserPrivacyRepository {
  private readonly _model;

  constructor() {
      this._model = new UserPrivacy();
  }

  /**
   * Creates privacy setting record in the database.
   * @param item: {userCognitoSub: string}
   * @returns instance of UserPrivacy
   */
  create(userCognitoSub: string): UserPrivacy {

      this._model.id = undefined; // prevent overwriting existing entries
      this._model.user_id = userCognitoSub;
      this._model.status = 'public';

      return this._model;
  }

  /**
   * Get a user's privacy status by userCognitoSub.
   * @param userCognitoSub: number
   * @returns Promise<any>
   */
    getPrivacyStatus(userCognitoSub: string): Promise<any> {
      return getRepository(UserPrivacy)
          .createQueryBuilder('userprivacy')
          .select('userprivacy')
          .where('user_id = :userCognitoSub', {userCognitoSub})
          .getOne();
  }

  /**
   * Updates a privacy setting from the privacy setting table.
   * @param userCognitoSub: string
   * @param status: string
   * @returns Promise<UpdateResult>
   */
  updatePrivacy(userCognitoSub: string, status: string): Promise<UpdateResult> {
    return getRepository(UserPrivacy)
        .createQueryBuilder('user_privacy')
        .update(UserPrivacy)
        .set({status})
        .where('user_id = :userCognitoSub', {userCognitoSub})
        .andWhere('deleted_at IS NULL')
        .execute();
  }
}

export default UserPrivacyRepository;