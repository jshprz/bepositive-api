import moment from 'moment';
import type { timestampsType } from '../modules/types';

class ResponseMutator {
  constructor() {}

  mutateApiResponseTimestamps<T extends timestampsType>(response: T): T {


        response.createdAt = Number(moment.unix(this._timestampToUnixDateTime(new Date(response.createdAt))));
        response.updatedAt = Number(moment.unix(this._timestampToUnixDateTime(new Date(response.updatedAt))));

        return response;
  }

  private _timestampToUnixDateTime(date: Date): number {
    return moment(date).unix();
  }
}

export default ResponseMutator;