import { Comments } from "../../../../database/postgresql/models/Comments";

interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: number, content: string}): Comments;
}

export default ICommentRepository;