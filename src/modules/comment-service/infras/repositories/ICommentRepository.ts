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

type getCommentsByPostIdReturnType = Promise<{
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: number,
    updatedAt: number,
    user: {}
}[]>;

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: number, content: string}): Comments;
    getCommentById(id: number, userId: string): Promise<getCommentByIdResult>;
    getCommentsByPostId(postId: number): getCommentsByPostIdReturnType;
    update(id: number, userId: string, content: string): Promise<UpdateResult>;
    removeCommentById(id: number): Promise<UpdateResult>;
}

export default ICommentRepository;