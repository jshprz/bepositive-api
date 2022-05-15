import { PostsHashtags } from "../../../../database/postgresql/models/PostsHashtags";

interface IPostHashtagRepository {
    create(hashtagId: string, postId: string): PostsHashtags;
    isPostHashtagExist(hashtagName: string, postId: string): Promise<boolean>;
}

export default IPostHashtagRepository;