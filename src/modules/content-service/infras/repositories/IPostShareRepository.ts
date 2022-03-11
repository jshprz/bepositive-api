import { UpdateResult } from "typeorm";
import { PostShares } from "../../../../database/postgresql/models/PostShares";

type getByIdAndUserCognitoSubReturnTypes = {
    id: number,
    postId: number,
    userId: string,
    shareCaption: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
}

interface IPostShareRepository {
    create(item: { userId: string, postId: number, shareCaption: string }): PostShares;
    get(id: number): Promise<any>;
    getByIdAndUserCognitoSub(id: number, userCognitoSub: string): Promise<getByIdAndUserCognitoSubReturnTypes>
    update(id: number, shareCaption: string): Promise<UpdateResult>
}

export default IPostShareRepository;