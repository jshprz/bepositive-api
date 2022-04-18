import { UpdateResult } from "typeorm";
import { PostShares } from "../../../../database/postgresql/models/PostShares";
import type { getByIdAndUserCognitoSubReturnTypes } from '../../../types';

interface IPostShareRepository {
    create(item: { userId: string, postId: string, shareCaption: string }): PostShares;
    get(id: string): Promise<any>;
    getByIdAndUserCognitoSub(id: string, userCognitoSub: string): Promise<getByIdAndUserCognitoSubReturnTypes>
    update(id: string, shareCaption: string): Promise<UpdateResult>
}

export default IPostShareRepository;