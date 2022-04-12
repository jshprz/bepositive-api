import awsS3 from "../../modules/content-service/infras/aws/AwsS3";
import postRepository from "../../modules/content-service/infras/repositories/PostRepository";
import postShareRepository from "../../modules/content-service/infras/repositories/PostShareRepository";
import postLikeRepository from "../../modules/content-service/infras/repositories/PostLikeRepository";

import userRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External
import feedRepository from "../../modules/feed-service/infras/repositories/FeedRepository"; // External

import postFacade from "../../modules/content-service/facades/PostFacade";
import postShareFacade from "../../modules/content-service/facades/PostShareFacade";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { config } from "../../config";
import uniqid from 'uniqid';

import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';

class ContentController {
    private _postFacade;
    private _postShareFacade;
    private _utilResponseMutator;

    constructor() {
        this._postFacade = new postFacade(new awsS3(), new postRepository(), new postLikeRepository(), new userRelationshipRepository(), new feedRepository());
        this._postShareFacade = new postShareFacade(new postShareRepository(), new postRepository());
        this._utilResponseMutator = new ResponseMutator();
    }

    async createPost(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.caption) {
            return res.status(400).json({
                message: errors.caption.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.files) {
            return res.status(400).json({
                message: errors.files.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.googlemapsPlaceId) {
            return res.status(400).json({
                message: errors.google_maps_place_id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
            const { caption, files, googlemapsPlaceId } = req.body;

            if (Array.isArray(files)) {
                // We append which folder inside S3 bucket the file will be uploaded.
                // We make the filename unique.
                files.forEach((file) => {
                    file.key = `${config.POST_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
                });
            }

            const createPostResult = await this._postFacade.createPost({userCognitoSub, caption, files, googlemapsPlaceId});

            return res.status(createPostResult.code).json({
                message: createPostResult.message,
                payload: createPostResult.data,
                status: createPostResult.code
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

    async getPostsByUser(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.userId) {
            return res.status(400).json({
                message: errors.userId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            // We'll first consider if a userId param is provided, which means that our intention is to retrieve the profile of another user.
            // Otherwise, the userCognitoSub of the currently logged-in user will be used for the query.
            const userCognitoSub: string = req.params.userId || req.body.userCognitoSub;

            const posts = await this._postFacade.getPostsByUser(userCognitoSub);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            posts.data.forEach((post) => {
                const timestamps = {
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                post.createdAt = unixTimestamps.createdAt;
                post.updatedAt = unixTimestamps.updatedAt;
            });

            return res.status(posts.code).json({
                message: posts.message,
                payload: posts.data,
                status: posts.code
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

    async getPostById(req: Request, res: Response) {
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
            const post = await this._postFacade.getPostById(id);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            const timestamps = {
                createdAt: post.data.createdAt,
                updatedAt: post.data.updatedAt
            }
            const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
            post.data.createdAt = unixTimestamps.createdAt;
            post.data.updatedAt = unixTimestamps.updatedAt;

            return res.status(post.code).json({
                message: post.message,
                payload: post.data,
                status: post.code
            });
        } catch (error: any) {
            if (error.code && error.code === 200) {
                return res.status(200).json({
                    message: error.message,
                    payload: error.data,
                    status: 200
                });
            } else if (error.code && error.code === 500) {
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

    async updatePost(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.caption) {
            return res.status(400).json({
                message: errors.caption.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id: number = Number(req.params.id);
            const caption: string = String(req.body.caption);

            const updatePostResult = await this._postFacade.updatePost(id, caption);

            return res.status(updatePostResult.code).json({
                message: updatePostResult.message,
                payload: updatePostResult.data,
                status: updatePostResult.code
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

    async removePost(req: Request, res: Response) {

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
            const removePostResult = await this._postFacade.removePost(id);

            return res.status(removePostResult.code).json({
                message: removePostResult.message,
                payload: removePostResult.data,
                status: removePostResult.code
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

    async sharePostById(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.postId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.shareCaption) {
            return res.status(400).json({
                message: errors.shareCaption.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const { shareCaption } = req.body;
            const userId: string = req.body.userCognitoSub;
            const postId: number = Number(req.params.id);

            const sharedPost = await this._postShareFacade.createSharedPost(postId, {userId, postId, shareCaption});

            return res.status(sharedPost.code).json({
                message: sharedPost.message,
                payload: sharedPost.data,
                status: sharedPost.code
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

    async getSharedPostById(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const sharedPostId = Number(req.params.id);
            const sharedPost = await this._postShareFacade.getSharedPostById(sharedPostId);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            const timestamps = {
                createdAt: sharedPost.data.createdAt,
                updatedAt: sharedPost.data.updatedAt
            }
            const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
            sharedPost.data.createdAt = unixTimestamps.createdAt;
            sharedPost.data.updatedAt = unixTimestamps.updatedAt;

            return res.status(sharedPost.code).json({
                message: sharedPost.message,
                payload: sharedPost.data,
                status: sharedPost.code
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

    async updateSharedPost(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.shareCaption) {
            return res.status(400).json({
                message: errors.shareCaption.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const sharedPostId: number = Number(req.params.id);
            const userCognitoSub: string = req.body.userCognitoSub;
            const shareCaption: string = req.body.shareCaption;

            const updateSharedPostResult = await this._postShareFacade.updateSharedPost(sharedPostId, userCognitoSub, shareCaption);

            return res.status(updateSharedPostResult.code).json({
               message: updateSharedPostResult.message,
               payload: updateSharedPostResult.data,
               status: updateSharedPostResult.code
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

    async likeOrUnlikePost(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.postId) {
            return res.status(400).json({
                message: errors.postId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const postId = req.body.postId;
            const userCognitoSub: string = req.body.userCognitoSub;

            const likeOrUnlikePostResult = await this._postFacade.likeOrUnlikePost(postId, userCognitoSub);

            return res.status(likeOrUnlikePostResult.code).json({
                message: likeOrUnlikePostResult.message,
                payload: likeOrUnlikePostResult.data,
                status: likeOrUnlikePostResult.code
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

export default ContentController;