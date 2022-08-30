import CommentRepository from "../../modules/comment-service/infras/repositories/CommentRepository";

import PostRepository from "../../modules/content-service/infras/repositories/PostRepository"; // External

import CommentFacade from "../../modules/comment-service/facades/CommentFacade";

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import ResponseMutator from "../../utils/ResponseMutator";
import type { getCommentRepliesByCommentIdReturnType, timestampsType } from '../../modules/types';

import UserProfileRepository from "../../infras/repositories/UserProfileRepository"; // External
import CommentLikeRepository from "../../modules/comment-service/infras/repositories/CommentLikeRepository";

class CommentController {
    private _commentFacade;
    private _utilResponseMutator;

    constructor() {
        this._commentFacade = new CommentFacade(new CommentRepository(), new PostRepository(), new CommentLikeRepository(), new UserProfileRepository());
        this._utilResponseMutator = new ResponseMutator();
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

        if (errors.classification) {
            return res.status(400).json({
                message: errors.classification.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
            const { postId, content, classification } = req.body;

            const addCommentResult = await this._commentFacade.addComment({ userCognitoSub, postId, content, classification });

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

    async getCommentsByPostId(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.postId) {
            return res.status(400).json({
                message: errors.postId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.classification) {
            return res.status(400).json({
                message: errors.classification.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const postId: string = req.params.postId;
            const classification: string = req.body.classification;
            const comments = await this._commentFacade.getCommentsByPostId(postId, classification, req.body.userCognitoSub);

            // Change the createdAt and updatedAt datetime format to unix timestamp for all comments/replies under the post
            // We do this as format convention for createdAt and updatedAt
            comments.data.forEach((comment) => {
                const timestamps = {
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                comment.createdAt = unixTimestamps.createdAt;
                comment.updatedAt = unixTimestamps.updatedAt;

                // replies
                comment.replies.forEach((reply) => {
                    const timestamps = {
                        createdAt: reply.createdAt,
                        updatedAt: reply.updatedAt
                    }
                    const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                    reply.createdAt = unixTimestamps.createdAt;
                    reply.updatedAt = unixTimestamps.updatedAt;

                    // child replies
                    reply.replies.forEach((childReply:getCommentRepliesByCommentIdReturnType) => {
                        const timestamps = {
                            createdAt: childReply.createdAt,
                            updatedAt: childReply.updatedAt
                        }
                        const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                        childReply.createdAt = unixTimestamps.createdAt;
                        childReply.updatedAt = unixTimestamps.updatedAt;
                    });

                });

            });

            return res.status(comments.code).json({
                message: comments.message,
                payload: comments.data,
                status: comments.code
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


    async updateCommentOrReply(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.content) {
            return res.status(400).json({
                message: errors.content.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.type) {
            return res.status(400).json({
                message: errors.type.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id: string = req.params.id;
            const { content, type } = req.body;

            const result = await this._commentFacade.updateCommentOrReply(id, req.body.userCognitoSub, content, type);

            return res.status(result.code).json({
                message: result.message,
                payload: result.data,
                status: result.code
            });
        } catch (error:any) {

            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                    });
                }
            else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                    });
                }
            else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                    });
            }
        }
    }

    async removeCommentOrReply(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.type) {
            return res.status(400).json({
                message: errors.type.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id: string = req.params.id;
            const type: string = req.body.type;

            const result = await this._commentFacade.removeCommentOrReply(id, req.body.userCognitoSub, type);

            return res.status(result.code).json({
                message: result.message,
                payload: result.data,
                status: result.code
            });

        } catch (error:any) {

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

    async likeOrUnlikeCommentOrReply(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.commentId) {
            return res.status(400).json({
                message: errors.commentId.msg,
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

        if (errors.like) {
            return res.status(400).json({
                message: errors.like.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.classification) {
            return res.status(400).json({
                message: errors.classification.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.commentType) {
            return res.status(400).json({
                message: errors.commentType.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { commentId, postId, like, classification, commentType } = req.body;
            const userCognitoSub: string = req.body.userCognitoSub;

            const likeOrUnlikeCommentResult = await this._commentFacade.likeOrUnlikeCommentOrReply(commentId, postId, userCognitoSub, like, classification, commentType);

            return res.status(likeOrUnlikeCommentResult.code).json({
                message: likeOrUnlikeCommentResult.message,
                payload: likeOrUnlikeCommentResult.data,
                status: likeOrUnlikeCommentResult.code
            });
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 400) {
                return res.status(400).json({
                    message: error.message,
                    error: 'Bad Request error',
                    status: 400
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

    async replyToComment(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.commentId) {
            return res.status(400).json({
                message: errors.commentId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.content) {
            return res.status(400).json({
                message: errors.content.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const commentId: string = String(req.params.commentId);
            const content: string = req.body.content;
            const userCognitoSub: string = req.body.userCognitoSub;

            const replyToCommentResult = await this._commentFacade.replyToComment({ commentId, userCognitoSub, content});

            return res.status(replyToCommentResult.code).json({
                message: replyToCommentResult.message,
                payload: replyToCommentResult.data,
                status: replyToCommentResult.code
            });
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 400) {
                return res.status(400).json({
                    message: error.message,
                    error: 'Bad Request error',
                    status: 400
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