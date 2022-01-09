import ICommentRepository from "../infras/repositories/ICommentRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';

import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External

class CommentFacade {
    private _log;

    constructor(private _commentRepository: ICommentRepository, private _postRepository: IPostRepository) {
        this._log = Logger.createLogger('CommentFacade.ts');
    }

    /**
     * Validate the post id and add a comment.
     * @param postId
     * @param commentAttr: {userCognitoSub: string, postId: number, content: string}
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         status: number
     *     }>
     */
    addComment(commentAttr: {userCognitoSub: string, postId: number, content: string}): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
           const post = await this._postRepository.getPostById(commentAttr.postId).catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       commentAttr
                   }
               });

               return reject(Error.DATABASE_ERROR.GET);
           });

           if (!post) {
               return reject({
                   message: 'Post not found.',
                   code: 404
               });
           }

           await this._commentRepository.create(commentAttr).save().catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       commentAttr
                   }
               });

               return reject(Error.DATABASE_ERROR.CREATE);
           });

           return resolve({
               message: 'Comment added successfully.',
               data: {},
               code: 201
           });
        });
    }
}

export default CommentFacade;