import type { getCommentRepliesByCommentIdReturnType } from '../../../modules/comment-service/types';

interface ICommentReplyRepository {
    get(commentId: string): Promise<getCommentRepliesByCommentIdReturnType>;
}

export default ICommentReplyRepository;