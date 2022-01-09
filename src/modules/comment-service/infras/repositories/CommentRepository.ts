import { Comments } from "../../../../database/postgresql/models/Comments";
import ICommentRepository from "./ICommentRepository";

class CommentRepository implements ICommentRepository {
    private readonly _model;

    constructor() {
        this._model = new Comments();
    }

    create(item: {userCognitoSub: string, postId: number, content: string}) {

        this._model.user_id = item.userCognitoSub;
        this._model.post_id = item.postId;
        this._model.content = item.content;
        this._model.status = 'active';
        this._model.created_at = Number(Date.now());

        return this._model;
    }
}

export default CommentRepository;