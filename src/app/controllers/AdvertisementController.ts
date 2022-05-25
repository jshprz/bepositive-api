
import AwsS3 from "../../modules/advertisement-service/infras/aws/AwsS3";
import AdvertisementRepository from "../../modules/advertisement-service/infras/repositories/AdvertisementRepository";
import AdvertisementFacade from "../../modules/advertisement-service/facades/AdvertisementFacade";
import e, { Request, Response } from "express";
import { validationResult, check } from "express-validator";
import { config } from "../../config";
import uniqid from 'uniqid';
import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';
import multer from "multer";
import mime from "mime";
import path from "path";
import PostLikeRepository from "../../modules/content-service/infras/repositories/PostLikeRepository";

type validateFileMimeTypeType = {
    isFailed: boolean,
    message: string | null
}

class AdvertisementController {
    private _advertisementFacade;
    private _utilResponseMutator;
    private _upload;

    constructor() {
        this._advertisementFacade = new AdvertisementFacade(
            new AwsS3(), new AdvertisementRepository(), new PostLikeRepository()
        );
        this._utilResponseMutator = new ResponseMutator();
        this._upload = multer().single('avatarFile');
    }

    async createAdvertisement(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.name) {
            return res.status(400).json({
                message: errors.name.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        if (errors.link) {
          return res.status(400).json({
              message: errors.link.msg,
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

        if (errors.isSponsored) {
            return res.status(400).json({
                message: errors.isSponsored.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
            const { name, link, caption, files, googleMapsPlaceId, isSponsored } = req.body;

            // files
            if (Array.isArray(files)) {
                // We append which folder inside S3 bucket the file will be uploaded.
                // We make the filename unique.
                files.forEach((file) => {
                    file.key = `${config.ADVERTISEMENT_UPLOAD_FOLDER_PATH}/${uniqid()}_${file.key}`;
                });
            }

            const createAdResult = await this._advertisementFacade.createAdvertisement({userCognitoSub, name, link, caption, files, googleMapsPlaceId, isSponsored});

            return res.status(createAdResult.code).json({
                message: createAdResult.message,
                payload: createAdResult.data,
                status: createAdResult.code
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

    async getAllAdvertisements(req: Request, res: Response) {
        try {
            const advertisements = await this._advertisementFacade.getAllAdvertisements();

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            advertisements.data.forEach((advertisement) => {
                const timestamps = {
                    createdAt: advertisement.content.createdAt,
                    updatedAt: advertisement.content.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                advertisement.content.createdAt = unixTimestamps.createdAt;
                advertisement.content.updatedAt = unixTimestamps.updatedAt;
            });

            return res.status(advertisements.code).json({
                message: advertisements.message,
                payload: advertisements.data,
                status: advertisements.code
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

    async getAdvertisementById(req: Request, res: Response) {

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
            const advertisement = await this._advertisementFacade.getAdvertisementById(id);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            const timestamps = {
                createdAt: advertisement.data.content.createdAt,
                updatedAt: advertisement.data.content.updatedAt
            }

            const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);

            advertisement.data.content.createdAt = unixTimestamps.createdAt;
            advertisement.data.content.updatedAt = unixTimestamps.updatedAt;

            return res.status(advertisement.code).json({
                message: advertisement.message,
                payload: advertisement.data,
                status: advertisement.code
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

    async updateAdvertisement(req: Request, res: Response) {

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
            const id: string = String(req.params.id);
            const caption: string = String(req.body.caption);

            const updateAdvertisementResult = await this._advertisementFacade.updateAdvertisement(id, caption);

            return res.status(updateAdvertisementResult.code).json({
                message: updateAdvertisementResult.message,
                payload: updateAdvertisementResult.data,
                status: updateAdvertisementResult.code
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

    async removeAdvertisement(req: Request, res: Response) {

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

            const removeAdvertisementResult = await this._advertisementFacade.removeAdvertisement(id);

            return res.status(removeAdvertisementResult.code).json({
                message: removeAdvertisementResult.message,
                payload: removeAdvertisementResult.data,
                status: removeAdvertisementResult.code
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

    async updateAdViewCount(req: Request, res: Response) {

        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {
            const id: string = String(req.params.id);

            const updateAdvertisementResult = await this._advertisementFacade.updateAdViewCount(id);

            return res.status(updateAdvertisementResult.code).json({
                message: updateAdvertisementResult.message,
                payload: updateAdvertisementResult.data,
                status: updateAdvertisementResult.code
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

    async likeOrUnlikeAdvertisement(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.advertisementId) {
            return res.status(400).json({
                message: errors.advertisementId.msg,
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

        try {
            const advertisementId: string = req.body.advertisementId;
            const like = req.body.like;
            const userCognitoSub: string = req.body.userCognitoSub;

            const likeOrUnlikeAdvertisementResult = await this._advertisementFacade.likeOrUnlikeAdvertisement(advertisementId, userCognitoSub, like);

            return res.status(likeOrUnlikeAdvertisementResult.code).json({
                message: likeOrUnlikeAdvertisementResult.message,
                payload: likeOrUnlikeAdvertisementResult.data,
                status: likeOrUnlikeAdvertisementResult.code
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

    async flagAdvertisement(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.id) {
            return res.status(400).json({
                message: errors.id.msg,
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
            const advertisementId: string = String(req.params.id);
            const reason: string = String(req.body.reason);

            const flagAdvertisementResult = await this._advertisementFacade.flagAdvertisement(req.body.userCognitoSub, advertisementId, reason);

            return res.status(flagAdvertisementResult.code).json({
                message: flagAdvertisementResult.message,
                payload: flagAdvertisementResult.data,
                status: flagAdvertisementResult.code
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

    async uploadAdvertisementAvatar(req: Request, res: Response) {

        this._upload(req, res, async (error) =>
        {

            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    message: 'A Multer error occurred when uploading',
                    error: 'Bad request error',
                    status: 400
                });
            } else if (error) {
                return res.status(520).json({
                    message: 'An unknown error occurred when uploading',
                    error: 'Unknown server error',
                    status: 520
                });
            } else {


                if (req.body) {
                    if (req.body.advertisementId == undefined || !req.body.advertisementId || req.body.advertisementId == null || req.body.advertisementId == '') {
                        // middleware cannot detect req.body.advertisementId since it's included in a form-data
                        return res.status(400).json({
                            message: 'advertisementId parameter is required.',
                            error: 'Bad request error',
                            status: 400
                        });
                    } else if (typeof(req.body.advertisementId) != 'string') {
                        return res.status(400).json({
                            message: 'advertisementId parameter should be a type of string.',
                            error: 'Bad request error',
                            status: 400
                        });
                    }
                }

                if (req.file) {
                    const fileExtension = path.extname(req.file.originalname);
                    const mimeType = req.file.mimetype;

                    if (this._validateFileMimeType(mimeType).isFailed) {
                        return res.status(400).json({
                            message: this._validateFileMimeType(mimeType).message,
                            error: 'Bad request error',
                            status: 400
                        });
                    }

                    // To check if the avatar filename extension is equal to the extension generated based on the mime type of the avatar file
                    // for recognizing whether the avatar extension is valid or not.
                    if (`.${this._validateFileMimeType(mimeType).message}` !== fileExtension && `${this._validateFileMimeType(mimeType).message}` !== 'jpeg') {
                        return res.status(400).json({
                            message: `invalid file extension: ${fileExtension} - ${this._validateFileMimeType(mimeType).message}`,
                            error: 'Bad request error',
                            status: 400
                        });
                    }

                    try {
                        if (req.file?.buffer) {
                            const uploadAdvertisementAvatarResult = await this._advertisementFacade.uploadAdvertisementAvatar(req.body.advertisementId, req.file.originalname, req.file.mimetype, req.file.buffer);

                            return res.status(
                                uploadAdvertisementAvatarResult.code).json({
                                message:
                                uploadAdvertisementAvatarResult.message,
                                payload: {
                                    location:
                                    uploadAdvertisementAvatarResult.data.Location
                                },
                                status:
                                uploadAdvertisementAvatarResult.code
                            });
                        }
                    } catch (error: any) {
                        return res.status(500).json({
                            message: error.message,
                            error: 'Internal server error',
                            status: 500
                        });
                    }

                } else {
                    return res.status(400).json({
                        message: 'form-data key avatarFile is required',
                        error: 'Bad request error',
                        status: 400
                    });
                }
            }
        });
    }

    private _validateFileMimeType(mimeType: string): validateFileMimeTypeType {
        switch (mimeType) {
            case 'image/jpeg':
            case 'image/png':
                return {
                    isFailed: false,
                    message: mime.getExtension(mimeType)
                }
            case '':
            default:
                return {
                    isFailed: true,
                    message: 'unsupported file extension. This API only accepts (jpg/jpeg, png)'
                }
        }
    }
}

export default AdvertisementController;