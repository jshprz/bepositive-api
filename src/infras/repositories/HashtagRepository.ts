import IHashtagRepository from "./interfaces/IHashtagRepository";
import { Hashtags } from "../../database/postgresql/models/Hashtags";
import { getRepository } from "typeorm";
import type { getHashtagType } from "../../modules/types";

class HashtagRepository implements IHashtagRepository {

    private readonly _model;

    constructor() {
        this._model = new Hashtags();
    }

    /**
     * Creates hashtag record in the database.
     * @param hashtagName: string
     * @returns instance of Hashtags
     */
    create(hashtagName: string): Hashtags {
        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.name = hashtagName;

        return this._model;
    }


    /**
     * Get a hashtag record by its name.
     * @param hashtagName: string
     * @returns Promise<getHashtagType>
     */
    async get(hashtagName: string): Promise<getHashtagType> {

        return new Promise(async (resolve, reject) => {
            const hashtag = await getRepository(Hashtags)
                .createQueryBuilder('hashtags')
                .select('hashtags')
                .where('name = :hashtagName', { hashtagName })
                .getOne()
                .catch((error) => {
                    return reject(error);
                });

            const tempHashtag = {
                id: '',
                name: '',
                createdAt: 0,
                updatedAt: 0
            }

            if (hashtag) {
                if (hashtag.name === hashtagName) {
                    const newHashtag = {
                        id: hashtag.id || '',
                        name: hashtag.name || '',
                        createdAt: hashtag.created_at || 0,
                        updatedAt: hashtag.updated_at || 0
                    }

                    return resolve(newHashtag);
                }

                return resolve(tempHashtag);
            } else {
                return resolve(tempHashtag);
            }
        });
    }

    /**
     * Get a hashtag record by id.
     * @param hashtagId: string
     * @returns Promise<getHashtagType>
     */
    async getById(hashtagId: string): Promise<getHashtagType> {

        return new Promise(async (resolve, reject) => {
            const hashtag = await getRepository(Hashtags)
                .createQueryBuilder('hashtags')
                .select('hashtags')
                .where('id = :hashtagId', { hashtagId })
                .getOne()
                .catch((error) => {
                    return reject(error);
                });

            if (hashtag) {
                const newHashtag = {
                    id: hashtag.id || '',
                    name: hashtag.name || '',
                    createdAt: hashtag.created_at || 0,
                    updatedAt: hashtag.updated_at || 0
                }

                return resolve(newHashtag);
            } else {
                return reject(`Unable to retrieve hashtag: ${hashtag}`);
            }
        });
    }
}

export default HashtagRepository;