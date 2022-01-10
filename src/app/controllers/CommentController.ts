import CommentRepository from "../../modules/comment-service/infras/repositories/CommentRepository";

import PostRepository from "../../modules/content-service/infras/repositories/PostRepository"; // External

import commentFacade from "../../modules/comment-service/facades/CommentFacade";

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Declaration merging on express-session
import '../../declarations/DExpressSession';

class CommentController {
    private _commentFacade;

    constructor() {
        this._commentFacade = new commentFacade(new CommentRepository(), new PostRepository());
    }

    async addComment(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.content) {
            return res.status(400).json({
                message: errors.content.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.postId) {
            return res.status(400).json({
                message: errors.postId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const userCognitoSub: string = req.session.user.sub;
            const { postId, content } = req.body;

            const addCommentResult = await this._commentFacade.addComment({ userCognitoSub, postId, content });

            return res.status(addCommentResult.code).json({
                message: addCommentResult.message,
                payload: addCommentResult.data,
                status: addCommentResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }
}

export default CommentController;