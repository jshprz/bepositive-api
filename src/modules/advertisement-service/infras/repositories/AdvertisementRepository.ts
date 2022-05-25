
import { getRepository, QueryFailedError, UpdateResult} from 'typeorm';
import { Advertisements } from "../../../../database/postgresql/models/Advertisements";
import { FlaggedPosts } from '../../../../database/postgresql/models/FlaggedPosts';
import { advertisementType } from '../../../types';
import IAdvertisementRepository from "./IAdvertisementRepository";

class AdvertisementRepository implements IAdvertisementRepository {

    private readonly _model;
    private readonly _flaggedPostModel;

    constructor() {
        this._model = new Advertisements();
        this._flaggedPostModel = new FlaggedPosts;
    }

    /**
     * Creates advertisement record in the database.
     *
     * @param item: { userCognitoSub: string, name: string, link: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string, isSponsored: boolean }
     * @returns instance of Advertisements
     */
    create(item: { userCognitoSub: string, name: string, link: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string, isSponsored: boolean }): Advertisements {
        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.name = item.name;
        this._model.link = item.link;
        this._model.caption = item.caption;
        this._model.view_count = 0;
        this._model.google_maps_place_id = item.googleMapsPlaceId;
        this._model.is_sponsored = item.isSponsored;
        this._model.s3_files = item.files;
        return this._model;
    }

    /**
     * Get all the advertisements.
     * @returns Promise<advertisementType[]>
     */
    getAllAdvertisements(): Promise<advertisementType[]> {
        return new Promise(async (resolve, reject) => {
            const advertisements = await getRepository(Advertisements)
                .createQueryBuilder('advertisements')
                .select('advertisements')
                .orderBy('view_count', 'ASC')
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            // We expect the advertisements to be an array, other types are not allowed.
            if (Array.isArray(advertisements)) {
                const newAdvertisements = advertisements.map((advertisement: {
                    advertisements_id: string,
                    advertisements_name: string,
                    advertisements_link: string,
                    advertisements_caption: string,
                    advertisements_view_count: number,
                    advertisements_avatar: string,
                    advertisements_google_maps_place_id: string,
                    advertisements_location_details: string,
                    advertisements_is_sponsored: boolean,
                    advertisements_s3_files: { key: string, type: string }[],
                    advertisements_created_at: Date,
                    advertisements_updated_at: Date
                }) => {
                    return {
                        content: {
                            classification: 'ADVERTISEMENT_POST',
                            advertisementId: advertisement.advertisements_id,
                            caption: advertisement.advertisements_caption,
                            googleMapsPlaceId: advertisement.advertisements_google_maps_place_id,
                            locationDetails: advertisement.advertisements_location_details,
                            link: advertisement.advertisements_link,
                            attachments: (advertisement && Array.isArray(advertisement.advertisements_s3_files))? advertisement?.advertisements_s3_files.map((r) => {
                                return {
                                    key: r.key,
                                    url: '',
                                    type: r.type,
                                    height: '',
                                    width: ''
                                }
                            }) : [{
                                key: '',
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                            }],
                            isSponsored: advertisement.advertisements_is_sponsored,
                            createdAt: advertisement.advertisements_created_at,
                            updatedAt: advertisement.advertisements_updated_at,
                        },
                        actor: {
                            userId: '',
                            name: advertisement.advertisements_name,
                            avatar: {
                                url: advertisement.advertisements_avatar,
                                type: '',
                                height: '',
                                width: ''
                            }
                        }
                    }
                });
                return resolve(newAdvertisements);
            }
            return reject('invalid type for advertisements');
        });
    }

    /**
     * Get a advertisement by id.
     * @param id: string
     * @returns Promise<advertisementType>
     */
      getAdvertisementById(id: string): Promise<advertisementType> {
        return new Promise(async (resolve, reject) => {
          const advertisement = await getRepository(Advertisements)
              .createQueryBuilder('advertisements')
              .select('advertisements')
              .where('id = :id', {id})
              .getOne()
              .catch((error: QueryFailedError) => {
                  return reject(error);
              });

          const newAdvertisement = {
            content: {
                classification: 'ADVERTISEMENT_POST',
                advertisementId: advertisement?.id || '',
                caption: advertisement?.caption || '',
                googleMapsPlaceId: advertisement?.google_maps_place_id || '',
                locationDetails: advertisement?.location_details || '',
                link: advertisement?.link || '',
                attachments: (advertisement && Array.isArray(advertisement.s3_files))? advertisement?.s3_files.map((r) => {
                    return {
                        key: r.key,
                        url: '',
                        type: r.type,
                        height: '',
                        width: ''
                    }
                }) : [{
                    key: '',
                    url: '',
                    type: '',
                    height: '',
                    width: ''
                }],
                isSponsored: advertisement?.is_sponsored || null,
                createdAt: advertisement?.created_at || 0,
                updatedAt: advertisement?.updated_at || 0,
            },
            actor: {
                userId: null,
                name: advertisement?.name || '',
                avatar: {
                    url: advertisement?.avatar || '',
                    type: '',
                    height: '',
                    width: ''
                  },
                }
            }
            return resolve(newAdvertisement);
        });
    }

    /**
     * Updates an advertisement from advertisements table.
     * @param id: string
     * @param caption: string
     * @returns Promise<UpdateResult>
     */
    update(id: string, caption: string): Promise<UpdateResult> {
        return getRepository(Advertisements)
            .createQueryBuilder('advertisements')
            .update(Advertisements)
            .set({caption})
            .where('id = :id', {id})
            .andWhere('deleted_at IS NULL')
            .execute();
    }

    /**
     * Performs soft delete for Advertisements
     * @param id: string
     * @returns Promise<boolean>
     */
    softDelete(id: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await getRepository(Advertisements)
                .createQueryBuilder()
                .where("id = :id", {id})
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            return resolve(true);
        })
    }

     /**
     * Increments an advertisement's view count from advertisements table.
     * @param id: string
     * @returns Promise<UpdateResult>
     */
      updateAdViewCount(id: string): Promise<UpdateResult> {
        return getRepository(Advertisements)
            .createQueryBuilder('advertisements')
            .update(Advertisements)
            .set({ view_count: () => "view_count + 1" })
            .where('id = :id', {id})
            .andWhere('deleted_at IS NULL')
            .execute();
    }

    /**
     * Creates flagged advertisement record in the database.
     * @param userCognitoSub: string
     * @param advertisementId: string
     * @param reason: string}
     * @returns instance of FlaggedPosts
     */
    flagAdvertisement(userCognitoSub: string, advertisementId: string, reason: string): FlaggedPosts {

        this._flaggedPostModel.id = undefined; // prevent overwriting existing entry from the same user
        this._flaggedPostModel.user_id = userCognitoSub;
        this._flaggedPostModel.post_id = advertisementId;
        this._flaggedPostModel.classification = "ADVERTISEMENT_POST";
        this._flaggedPostModel.reason = reason;

        return this._flaggedPostModel;
    }

    /**
     * Update the user avatar.
     * @param advertisementId: string
     * @param avatar: string
     * @returns Promise<UpdateResult>
     */
     uploadAdvertisementAvatar(advertisementId: string, avatar: string): Promise<UpdateResult> {

        return getRepository(Advertisements)
            .createQueryBuilder('advertisements')
            .update(Advertisements)
            .set({
                avatar
            })
            .where('id = :advertisementId', {advertisementId})
            .execute();
    }
}

export default AdvertisementRepository;
