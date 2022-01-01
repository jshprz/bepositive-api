import awsS3 from "../../modules/content-service/infras/aws/AwsS3";
import postRepository from "../../modules/content-service/infras/repositories/PostRepository";

import userRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External
import feedRepository from "../../modules/feed-service/infras/repositories/FeedRepository"; // External

import postFacade from "../../modules/content-service/facades/PostFacade";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { config } from "../../config";
import uniqid from 'uniqid';

// Declaration merging on express-session
import '../../declarations/DExpressSession';

class ContentController {
    private _postFacade;

    constructor() {
        this._postFacade = new postFacade(new awsS3(), new postRepository(), new userRelationshipRepository(), new feedRepository());
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

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const userCognitoSub: string = req.session.user.sub;
            const { caption, files, googlemapsPlaceId } = req.body;

            // We append which folder inside S3 bucket the file will be uploaded.
            // We make the filename unique.
            files.forEach((file) => {
                file.key = `${config.POST_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
            });

            const uploadSignedUrls = await this._postFacade.createPost({userCognitoSub, caption, files, googlemapsPlaceId});

            return res.status(200).json({
                message: 'Post created successfully.',
                payload: {
                    upload_signed_urls: uploadSignedUrls,
                },
                status: 200
            });
        } catch (error) {
            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
        }
    }

    async getPostsByUser(req: Request, res: Response) {

        if (!req.session.user) {
            return res.status(401).json({
                message: 'please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const userCognitoSub: string = req.session.user.sub;

            const posts = await this._postFacade.getPostsByUser(userCognitoSub);

            return res.status(200).json({
                message: 'Posts successfully retrieved',
                payload: {
                    posts
                },
                status: 200
            });
        } catch (error) {
            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
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

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const post = await this._postFacade.getPostById(req.params.id);

            return res.status(200).json({
                message: 'Post retrieved',
                payload: {
                    post
                },
                status: 200
            });
        } catch (error: any) {

            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
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

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {

            await this._postFacade.updatePost(req.params.id, req.body.caption);

            return res.status(200).json({
                message: 'The post was updated successfully.',
                payload: {},
                status: 200
            });

        } catch (error) {

            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
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

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {

            await this._postFacade.removePost(req.params.id);

            return res.status(200).json({
                message: 'The post was successfully deleted.',
                payload: {},
                status: 200
            });

        } catch (error) {

            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
        }
    }
}

export default ContentController;