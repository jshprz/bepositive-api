import { getRepository } from "typeorm";
import { PostShares } from "../../../../database/postgresql/models/PostShares";
import IPostShareRepository from "./IPostShareRepository";

class PostShareRepository implements IPostShareRepository {

    private readonly _model;

    constructor() {
        this._model = new PostShares();
    }

    /**
     * Creates post share  record.
     * @param item: { userId: string, postId: number, shareCaption: string }
     * @returns Promise<number|undefined>
     */
    create(item: { userId: string, postId: number, shareCaption: string }) {

        this._model.post_id = item.postId;
        this._model.user_id = item.userId;
        this._model.share_caption = item.shareCaption;
        this._model.created_at = Number(Date.now());

        return this._model;
    }

    /**
     * Gets a shared post by ID.
     * @param id: number
     * @returns Promise<any>
     */
    get(id: number): Promise<any> {

        return getRepository(PostShares)
            .createQueryBuilder('post_shares')
            .select('post_shares')
            .where('id = :id', {id})
            .getOne();
    }
}

export default PostShareRepository;