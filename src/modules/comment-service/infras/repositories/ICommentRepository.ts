import { UpdateResult } from "typeorm";
import { Comments } from "../../../../database/postgresql/models/Comments";
import type { getCommentByIdResult, getCommentsByPostIdReturnType } from '../../../types';

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: string, content: string}): Comments;
    getCommentById(id: string, userId: string): Promise<getCommentByIdResult>;
    getCommentsByPostId(postId: string): Promise<getCommentsByPostIdReturnType[]>;
    update(id: string, userId: string, content: string): Promise<UpdateResult>;
    softDelete(id: string): Promise<boolean>;
}

export default ICommentRepository;