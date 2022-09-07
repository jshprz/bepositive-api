import { PostsHashtags } from "../../../database/postgresql/models/PostsHashtags";
import type { postsHashtagsType } from '../../../modules/content-service/types';

interface IPostHashtagRepository {
    create(hashtagId: string, postId: string): PostsHashtags;
    isPostHashtagExist(hashtagName: string, postId: string): Promise<boolean>;
    getByHashtagId(hashtagId: string, pagination: {page: number, size: number}): Promise<postsHashtagsType[]>;
}

export default IPostHashtagRepository;