import { UpdateResult } from "typeorm";
import { Comments } from "../../../../database/postgresql/models/Comments";

type getCommentByIdResult = {
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
};

type getCommentsByPostIdReturnType = Promise<{
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    user: {}
}[]>;

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: number, content: string}): Comments;
    getCommentById(id: number, userId: string): Promise<getCommentByIdResult>;
    getCommentsByPostId(postId: number): getCommentsByPostIdReturnType;
    update(id: number, userId: string, content: string): Promise<UpdateResult>;
    softDelete(id: number): Promise<boolean>;
}

export default ICommentRepository;