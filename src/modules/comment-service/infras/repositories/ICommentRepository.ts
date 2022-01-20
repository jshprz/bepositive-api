import { UpdateResult } from "typeorm";
import { Comments } from "../../../../database/postgresql/models/Comments";

type getCommentByIdResult = {
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: number,
    updatedAt: number,
    deletedAt: number
};

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: number, content: string}): Comments;
    getCommentById(id: number, userId: string): Promise<getCommentByIdResult>;
    update(id: number, userId: string, content: string): Promise<UpdateResult>;
}

export default ICommentRepository;