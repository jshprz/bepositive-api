import AwsS3 from "../../infras/aws/AwsS3";
import PostRepository from "../../infras/repositories/PostRepository";
import PostShareRepository from "../../infras/repositories/PostShareRepository";
import PostLikeRepository from "../../infras/repositories/PostLikeRepository";
import HashtagRepository from "../../infras/repositories/HashtagRepository";
import PostHashtagRepository from "../../infras/repositories/PostHashtagRepository";

import UserRelationshipRepository from "../../infras/repositories/UserRelationshipRepository"; // External
import FeedRepository from "../../infras/repositories/FeedRepository"; // External
import UserProfileRepository from "../../infras/repositories/UserProfileRepository"; // External

import Post from "../../modules/content-service/Post";
import SharedPost from "../../modules/content-service/SharedPost";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { config } from "../../config";
import uniqid from 'uniqid';

import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';

class ContentController {
    private _post;
    private _postShareFacade;
    private _utilResponseMutator;

    constructor() {
        this._post = new Post(
            new AwsS3(), new PostRepository(),
            new PostShareRepository(),
            new PostLikeRepository(),
            new UserRelationshipRepository(),
            new FeedRepository(),
            new UserProfileRepository(),
            new HashtagRepository(),
            new PostHashtagRepository()
        );
        this._postShareFacade = new SharedPost(
            new PostShareRepository(),
            new PostRepository(),
            new UserRelationshipRepository(),
            new FeedRepository()
        );
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

        if (errors.googleMapsPlaceId) {
            return res.status(400).json({
                message: errors.googleMapsPlaceId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
            const { caption, files, googleMapsPlaceId } = req.body;

            const hashtagNames: string[] = this._getHashtagsInCaption(caption);

            const createdHashtagIds = await this._post.createHashtag(hashtagNames);

            if (Array.isArray(files)) {
                // We append which folder inside S3 bucket the file will be uploaded.
                // We make the filename unique.
                files.forEach((file) => {
                    file.key = `${config.POST_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
                });
            }

            const createPostResult = await this._post.createPost({userCognitoSub, caption, files, googleMapsPlaceId});

            await this._post.createPostsHashtags(createdHashtagIds.data, createPostResult.data.postId);

            return res.status(createPostResult.code).json({
                message: createPostResult.message,
                payload: {
                    uploadSignedURLs: createPostResult.data.uploadSignedURLs
                },
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

    _getHashtagsInCaption(caption: string): string[] {
        const extractedHashtags = caption.split('#').map((item, index) => {
            let hashtagName = '';

            // We make sure that each of the hashtag contains a valid word.
            // We don't accept whitespaces in a hashtag and any other escape characters.
            if (index !== 0) {
                hashtagName = item.split(' ')[0];
                hashtagName = hashtagName.split('\n')[0];
                hashtagName = hashtagName.split('\t')[0];
                hashtagName = hashtagName.split('\b')[0];
                hashtagName = hashtagName.split('\r')[0];
            }

            return hashtagName;
        }).filter((item) => {
            // We filter each of the extracted hashtag to make sure we get a valid one.

            const constraint1 = item.trim();
            const constraint2 = item.indexOf(' ');

            return constraint1.length > 0 && constraint2 !== 0;
        }).map((item) => {
            return item.toLowerCase();
        });

        return extractedHashtags;
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

            const posts = await this._post.getPostsByUser(userCognitoSub, req.body.userCognitoSub);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            posts.data.forEach((post) => {
                const timestamps = {
                    createdAt: post.content.createdAt,
                    updatedAt: post.content.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                post.content.createdAt = unixTimestamps.createdAt;
                post.content.updatedAt = unixTimestamps.updatedAt;
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

    async getFavoritePostsByUser(req: Request, res: Response) {

        try {
            // We'll first consider if a userId param is provided, which means that our intention is to retrieve the profile of another user.
            // Otherwise, the userCognitoSub of the currently logged-in user will be used for the query.
            const userId: string = req.params.userId || req.body.userCognitoSub;
            const getFavoritePostsByUserIdResult = await this._post.getFavoritePostsByUserId(userId, req.body.userCognitoSub);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            getFavoritePostsByUserIdResult.data.forEach((post) => {
                const timestamps = {
                    createdAt: post.content.createdAt,
                    updatedAt: post.content.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                post.content.createdAt = unixTimestamps.createdAt;
                post.content.updatedAt = unixTimestamps.updatedAt;
            });

            return res.status(getFavoritePostsByUserIdResult.code).json({
                message: getFavoritePostsByUserIdResult.message,
                payload: getFavoritePostsByUserIdResult.data,
                status: getFavoritePostsByUserIdResult.code
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
            const id: string = req.params.id;
            const post = await this._post.getPostById(id, req.body.userCognitoSub);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            const timestamps = {
                createdAt: post.data.content.createdAt,
                updatedAt: post.data.content.updatedAt
            }
            const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
            post.data.content.createdAt = unixTimestamps.createdAt;
            post.data.content.updatedAt = unixTimestamps.updatedAt;

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
            const id: string = req.params.id;
            const caption: string = String(req.body.caption);

            const updatePostResult = await this._post.updatePost(req.body.userCognitoSub, id, caption);

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

        if (errors.classification) {
            return res.status(400).json({
                message: errors.classification.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const postId: string = req.params.id;
            const classification: string = req.body.classification;
            let responseData: {
                message: string,
                data: {},
                code: number
            } = {message: '', data: {}, code: 0};

            if (classification === 'REGULAR_POST') {
                const removeRegularPost = await this._post.removePost(req.body.userCognitoSub, postId);
                responseData = removeRegularPost;
            }
            if (classification === 'SHARED_POST') {
                const removeSharedPost = await this._postShareFacade.removeSharedPost(req.body.userCognitoSub, postId);
                responseData = removeSharedPost;
            }

            return res.status(responseData.code).json({
                message: responseData.message,
                payload: responseData.data,
                status: responseData.code
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
            const postId: string = req.params.id;

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
            const sharedPostId: string = req.params.id;
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
            const sharedPostId: string = req.params.id;
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

        try {
            const postId: string = req.body.postId;
            const like = req.body.like;
            const userCognitoSub: string = req.body.userCognitoSub;
            const classification: string = req.body.classification;

            const likeOrUnlikePostResult = await this._post.likeOrUnlikePost(postId, userCognitoSub, like, classification);

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

    async flagPost(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
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

        if (errors.reason) {
            return res.status(400).json({
                message: errors.reason.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const postId: string = String(req.params.id);
            const reason: string = String(req.body.reason);
            const classification: string = req.body.classification ? req.body.classification : "REGULAR_POST";

            const flagPostResult = await this._post.flagPost(req.body.userCognitoSub, postId, classification, reason);

            return res.status(flagPostResult.code).json({
                message: flagPostResult.message,
                payload: flagPostResult.data,
                status: flagPostResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 401) {
                return res.status(401).json({
                    message: error.message,
                    error: 'Unauthorized',
                    status: 401
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

    async getPostsByHashtag(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.hashtagId) {
            return res.status(400).json({
                message: errors.hashtagId.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.page) {
            return res.status(400).json({
                message: errors.page.msg,
                error: 'bad request error',
                status: 400
            });
        }

        if (errors.size) {
            return res.status(400).json({
                message: errors.size.msg,
                error: 'bad request error',
                status: 400
            });
        }

        try {
            const hashtagId: string = req.params.hashtagId;
            const pagination = {
                page: Number(req.query.page),
                size: Number(req.query.size)
            };

            const getPostsByHashtagResult = await this._post.getPostsByHashtag(hashtagId, pagination);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            getPostsByHashtagResult.data.posts.forEach((post) => {
                const timestamps = {
                    createdAt: post.content.createdAt,
                    updatedAt: post.content.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

                post.content.createdAt = unixTimestamps.createdAt;
                post.content.updatedAt = unixTimestamps.updatedAt;
            });

            return res.status(getPostsByHashtagResult.code).json({
                message: getPostsByHashtagResult.message,
                payload: getPostsByHashtagResult.data,
                status: getPostsByHashtagResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 401) {
                return res.status(401).json({
                    message: error.message,
                    error: 'Unauthorized',
                    status: 401
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