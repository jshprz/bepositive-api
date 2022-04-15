import CommentRepository from "../../modules/comment-service/infras/repositories/CommentRepository";

import PostRepository from "../../modules/content-service/infras/repositories/PostRepository"; // External

import commentFacade from "../../modules/comment-service/facades/CommentFacade";

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';

import userAccountFacade from "../../modules/user-service/facades/UserAccountFacade"; // External
import AwsCognito from "../../modules/user-service/infras/aws/AwsCognito"; // External
import AwsS3 from "../../modules/user-service/infras/aws/AwsS3"; // External
import UserRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External
import UserProfileRepository from "../../modules/user-service/infras/repositories/UserProfileRepository"; // External

class CommentController {
    private _commentFacade;
    private _utilResponseMutator;
    private _userAccountFacade;

    constructor() {
        this._commentFacade = new commentFacade(new CommentRepository(), new PostRepository());
        this._utilResponseMutator = new ResponseMutator();
        this._userAccountFacade = new userAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
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

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
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

    async getCommentsByPostId(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.postId) {
            return res.status(400).json({
                message: errors.postId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const postId: number = Number(req.params.postId);

            const comments = await this._commentFacade.getCommentsByPostId(postId);

            for (const comment of comments.data) {
                // Get the user profile data every post in the feed.
                const userProfileData = await this._userAccountFacade.getUserProfile(comment.userId);
                const { id, name, avatar } = userProfileData.data;
                comment.user = {
                    id,
                    name,
                    avatar
                }
            }

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            comments.data.forEach((comment) => {
                const timestamps = {
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                comment.createdAt = unixTimestamps.createdAt;
                comment.updatedAt = unixTimestamps.updatedAt;
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


    async updateComment(req: Request, res: Response) {

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
                message: errors.caption.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id = Number(req.params.id);
            const content = String(req.body.content);

            const result = await this._commentFacade.updateComment(id, req.body.userCognitoSub, content);

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

    async removeComment(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id = Number(req.params.id);

            const result = await this._commentFacade.removeComment(id, req.body.userCognitoSub);

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
}

export default CommentController;