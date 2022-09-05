
import IAwsS3 from "../../advertisement-service/infras/aws/IAwsS3";
import IAdvertisementRepository from "../infras/repositories/IAdvertisementRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';
import { Client } from '@googlemaps/google-maps-services-js';
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import moment from "moment";
import { QueryFailedError } from "typeorm";
import type { advertisementType } from '../../types';
import IPostLikeRepository from "../../../infras/repositories/interfaces/IPostLikeRepository";

class AdvertisementFacade {

    private _log;
    private _googleapis;

    constructor(
        private _awsS3: IAwsS3,
        private _advertisementRepository: IAdvertisementRepository,
        private _postLikeRepository: IPostLikeRepository
    ) {
        this._log = Logger.createLogger('AdvertisementFacade.ts');
        this._googleapis = new Client({});
    }


    /**
     * Creates an advertisement.
     * @param item: { userCognitoSub: string, name: string, link: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string, isSponsored: boolean }
     * @returns Promise<{
     *         message: string,
     *         data: string[],
     *         code: number
     *     }>
     */
    createAdvertisement(item: { userCognitoSub: string, name: string, link: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string, isSponsored: boolean }): Promise<{
        message: string,
        data: { uploadSignedURLs: string[], advertisementId: string},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {

            // files
            const preSignedURLPromises: Promise<string>[] = [];

            // Collect the pre-signed urls promises and resolve them later.
            item.files.forEach((file: {key: string, type: string}) => {
                preSignedURLPromises.push(this._awsS3.presignedPutUrl(file.key, file.type, 'public-read'));
            });

            Promise.allSettled(preSignedURLPromises).then(async (results) => {
                const resultsMap = results.map((result) => {
                    if (result.status !== 'rejected') {
                        return result.value
                    }
                    this._log.error({
                        function: 'createAdvertisement() & presignedPutUrl()',
                        message: result.reason.toString(),
                        payload: item
                    });

                    return '';
                });

                const advertisement = await this._advertisementRepository.create(item).save().catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'createAd()',
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: item
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.CREATE,
                        code: 500
                    });
                });

                return resolve({
                    message: 'Advertisement created successfully.',
                    data: {
                        uploadSignedURLs: resultsMap.filter(result => result !== ''),
                        advertisementId: advertisement?.id || ''
                    },
                    code: 200
                });
            });
        });
    }

    /**
    * Get all the advertisements.
    *
    * @returns Promise<{
     *         message: string,
     *         data: postType[],
     *         code: number
     *     }>
     */
    getAllAdvertisements(): Promise<{
        message: string,
        data: advertisementType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const advertisements: advertisementType[] | void = await this._advertisementRepository.getAllAdvertisements().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getAllAdvertisements()',
                    message: error.toString(),
                    payload: { }
                });

                return reject({
                    message: error,
                    code: 500
                });
            });


            // We expect the advertisements to be an array, other types are not allowed.
            if (Array.isArray(advertisements)) {

                const promises: Promise<advertisementType>[] = [];
                // To add location details and complete URLs for the S3 file keys on each advertisement.

                advertisements.forEach((advertisement) => {
                    promises.push(this._processAdvertisementLocationAndMediaFiles(advertisement));
                });

                Promise.allSettled(promises).then((results) => {
                    const tempAdvertisementData = {
                        content: {
                            classification: 'ADVERTISEMENT_POST',
                            advertisementId: '',
                            caption: '',
                            googleMapsPlaceId: '',
                            locationDetails: '',
                            link: '',
                            viewCount: 0,
                            attachments: [{
                                key: '',
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                            }],
                            isSponsored: false,
                            createdAt: 0,
                            updatedAt: 0,
                        },
                        actor: {
                            userId: null,
                            name: '',
                            avatar: {
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                              },
                        }
                    };

                    const resultsMap = results.map(r => r.status !== 'rejected'? r.value : tempAdvertisementData);
                    return resolve({
                        message: 'Advertisements successfully retrieved',
                        data: resultsMap,
                        code: 200
                    });
                });
            } else {
                return reject({
                    message: 'invalid type for advertisements',
                    code: 500
                });
            }
        });
    }

    /**
     * Get an advertisement by its ID.
     * @param id: string
     * @returns Promise<{
     *   message: string,
     *   data: advertisementType,
     *   code: number
     * }>
     */
    getAdvertisementById(id: string): Promise<{
        message: string,
        data: advertisementType,
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const advertisement: advertisementType | void = await this._advertisementRepository.getAdvertisementById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getAdvertisementById()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: { id }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (advertisement && advertisement.content.advertisementId && advertisement.content.advertisementId !== '') {

                if (advertisement.content.googleMapsPlaceId) {
                    // Retrieve post location details
                    const place = await this._googleapis.placeDetails({
                        params: {
                            place_id: advertisement.content.googleMapsPlaceId,
                            key: `${process.env.GOOGLE_MAPS_API_KEY}`
                        }
                    }).catch((error) => {
                        throw error.stack;
                    });
                    advertisement.content.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
                }

                if (advertisement.content.attachments) {
                    advertisement.content.attachments.forEach((file) => {
                        file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                    });
                }

                if (advertisement && advertisement.actor.avatar && advertisement.actor.avatar.url) {
                    if (advertisement.actor.avatar.url !== '') {
                        advertisement.actor.avatar.url = `${process.env.AWS_S3_BUCKET_URL}/${advertisement.actor.avatar.url}`; // S3 object file URL.
                    }
                }

                return resolve({
                    message: 'Advertisement retrieved',
                    data: advertisement,
                    code: 200
                });
            } else {
                this._log.info({
                    function: 'getAdvertisementById()',
                    message: 'Advertisement retrieval info',
                    payload: { id }
                });
                return reject({
                    message: 'Advertisement not found',
                    code: 404
                });
            }
        });
    }

    /**
     * Update the caption of the advertisement.
     *
     * @param id: string
     * @param caption: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    updateAdvertisement(id: string, caption: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const advertisement: advertisementType | void = await this._advertisementRepository.getAdvertisementById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                      id,
                      caption
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!advertisement || (advertisement && (!advertisement.content.advertisementId || advertisement.content.advertisementId == ''))) {
                return reject({
                    message: 'Advertisement not found.',
                    code: 404
                });
            }
            await this._advertisementRepository.update(id, caption);

            return resolve({
                message: 'The advertisement was updated successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Remove an advertisement by ID.
     *
     * @param id: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    removeAdvertisement(id: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const advertisement: advertisementType | void = await this._advertisementRepository.getAdvertisementById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'removeAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                     id
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!advertisement || (advertisement && (!advertisement.content.advertisementId || advertisement.content.advertisementId == ''))) {
                return reject({
                    message: 'Advertisement not found.',
                    code: 404
                });
            }

            await this._advertisementRepository.softDelete(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'removeAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                      id
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            return resolve({
                message: 'The advertisement was successfully deleted.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Increment the view count of an advertisement.
     *
     * @param id: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
     updateAdViewCount(id: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const advertisement: advertisementType | void = await this._advertisementRepository.getAdvertisementById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateAdViewCount()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                      id
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!advertisement || (advertisement && (!advertisement.content.advertisementId || advertisement.content.advertisementId == ''))) {
                return reject({
                    message: 'Advertisement not found.',
                    code: 404
                });
            }
            await this._advertisementRepository.updateAdViewCount(id);

            return resolve({
                message: 'The advertisement view count was updated successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * To add complete URLs for the S3 file keys on an advertisement object.
     * @param advertisement: advertisementType
     * @private Promise<advertisementType>
     */
    private async _processAdvertisementLocationAndMediaFiles(advertisement: advertisementType): Promise<advertisementType> {

        if (advertisement) {
            if (advertisement.content.advertisementId === '') {
                return advertisement;
            }

            if (advertisement.content.googleMapsPlaceId) {
                // Retrieve advertisement location details
                const place = await this._googleapis.placeDetails({
                    params: {
                        place_id: advertisement.content.googleMapsPlaceId,
                        key: `${process.env.GOOGLE_MAPS_API_KEY}`
                    }
                }).catch((error) => {
                    throw error.stack;
                });
                advertisement.content.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
            }

            if (advertisement.content.attachments) {
                advertisement.content.attachments.forEach((file) => {
                    file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                });
            }
        }
        return advertisement;
    }

    /**
     * To like or unlike an advertisement.
     * @param advertisementId: string
     * @param userCognitoSub: string
     * @param like: boolean
     * @returns Promise<{
     *         message: string,
     *         data: {isLiked: boolean},
     *         code: number
     *     }>
     */
    likeOrUnlikeAdvertisement(advertisementId: string, userCognitoSub: string, like: boolean): Promise<{
        message: string,
        data: {isLiked: boolean},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const ad = await this._advertisementRepository.getAdvertisementById(advertisementId).catch((error) => {
                this._log.error({
                    function: 'likeOrUnlikeAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        like,
                        userCognitoSub
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            // check if ad exists first.
            if (!ad || (ad && ad.content.advertisementId == "" ) || (ad && !ad.content.advertisementId)) {
                return reject({
                    message: 'Advertisement does not exist.',
                    code: 404
                });
            }

            // check if user has already liked or unliked the ad
            const adLiked = await this._postLikeRepository.getByIdAndUserId(advertisementId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: 'likeOrUnlikeAdvertisement() - getByIdAndUserId',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        userCognitoSub
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (like && adLiked) {
                return reject({
                    message: "Advertisement already liked.",
                    code: 400
                });
            } else if (!like && !adLiked) {
                return reject({
                    message: "Advertisement already unliked.",
                    code: 400
                });
            }

            // create or delete a record in the database depending on the value of the like parameter.
            if (like) {
                const likeResult = await this._likeAdvertisement(advertisementId, userCognitoSub).catch((error) => {
                    return reject(error);
                });

                if (likeResult) {
                    return resolve({
                        message: 'Advertisement successfully liked.',
                        data: {isLiked: true},
                        code: 200
                    });
                }
            } else {
                const unlikeResult = await this._unlikeAdvertisement(advertisementId, userCognitoSub).catch((error) => {
                    return reject(error);
                });

                if (unlikeResult) {
                    return resolve({
                        message: 'Advertisement successfully unliked.',
                        data: {isLiked: false},
                        code: 200
                    });
                }
            }
        });
    }

    /**
     * To like an advertisement.
     * @param advertisementId: string
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _likeAdvertisement(advertisementId: string, userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this._postLikeRepository.create(userCognitoSub, advertisementId, "ADVERTISEMENT_POST").save().catch((error: QueryFailedError) => {
                this._log.error({
                    function: '_likeAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        userCognitoSub
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                });
            });

            resolve(true);
        });
    }

    /**
     * To unlike an advertisement.
     * @param advertisementId: string
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _unlikeAdvertisement(advertisementId: string, userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve,reject) => {
            await this._postLikeRepository.deleteByIdAndUserId(advertisementId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: '_unlikeAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        userCognitoSub
                    }
                });

                return reject(Error.DATABASE_ERROR.DELETE);
            });

            resolve(true);
        });
    }

    /**
     * Flag an advertisement
     * @param userId: string
     * @param advertisementId: string
     * @param reason: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    flagAdvertisement(userId: string, advertisementId: string, reason: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const ad: advertisementType | void = await this._advertisementRepository.getAdvertisementById(advertisementId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'flagAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        userId,
                        advertisementId,
                        reason
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            })

            if (!ad || (ad && (!ad.content.advertisementId || ad.content.advertisementId == ''))) {
                return reject({
                    message: 'Advertisement not found.',
                    code: 404
                });
            }

            // do not permit users to report their own posts
            if (ad && ad.actor.userId === userId) {
                return reject({
                    message: 'Reporting of own ad is not permitted.',
                    code: 401
                });
            }

            await this._advertisementRepository.flagAdvertisement(userId, advertisementId, reason).save().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'flagAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {userId, advertisementId, reason}
                });

                return reject({
                    message: error.message,
                    code: 500
                });
            });

            return resolve({
                message: 'The advertisement was reported successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Upload advertisement avatar to S3 and update the advertisement avatar in the database record.
     * @param advertisementId: string
     * @param file: {
     *  key: string,
     *  type: string
     * }
     * @returns Promise<{
     *     message: string,
     *     data: SendData,
     *     code: number
     * }>
     */
    uploadAdvertisementAvatar(advertisementId: string, file: {key: string, type: string}): Promise<{
        message: string,
        data: { uploadSignedURL: string},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {

            const advertisement: advertisementType | void = await this._advertisementRepository.getAdvertisementById(advertisementId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateAdvertisement()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        file
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Advertisement not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!advertisement || (advertisement && (!advertisement.content.advertisementId || advertisement.content.advertisementId == ''))) {
                return reject({
                    message: 'Advertisement not found.',
                    code: 404
                });
            }

            const presignedPutUrl: string | void = await this._awsS3.presignedPutUrl(file.key, file.type, 'public-read').catch((error: Error) => {
                this._log.error({
                    function: 'uploadAdvertisementAvatar() & presignedPutUrl()',
                    message: error.message,
                    payload: {
                        advertisementId,
                        file
                    }
                });

                return reject({
                    message: Error.AWS_S3_ERROR,
                    code: 500
                });
            });

            // update advertisement with avatar
            await this._advertisementRepository.uploadAdvertisementAvatar(advertisementId, file.key).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'uploadAdvertisementAvatar()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        advertisementId,
                        file
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            return resolve({
                message: 'advertisement avatar was successfully uploaded.',
                data: { uploadSignedURL : presignedPutUrl || '' },
                code: 200
            });
        });
    }
}

export default AdvertisementFacade;
