import { DeleteResult } from "typeorm";

interface IPostLikeRepository {
    create(item: {userCognitoSub: string, postId: number});
    getByIdAndUserId(postId: number, userCognitoSub: string): Promise<any>;
    deleteByIdAndUserId(postId: number, userCognitoSub: string): Promise<DeleteResult>;
}

export default IPostLikeRepository;