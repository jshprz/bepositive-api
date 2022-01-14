import { PostShares } from "../../../../database/postgresql/models/PostShares";

interface IPostShareRepository {
    create(item: { userId: string, postId: number, shareCaption: string }): PostShares;
    get(id: number): Promise<any>;
}

export default IPostShareRepository;