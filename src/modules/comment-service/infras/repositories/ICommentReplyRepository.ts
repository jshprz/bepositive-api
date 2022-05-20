import type { getCommentRepliesByCommentIdReturnType } from '../../../types';

interface ICommentReplyRepository {
    get(commentId: string): Promise<getCommentRepliesByCommentIdReturnType>;
}

export default ICommentReplyRepository;