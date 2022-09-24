import IHashtagRepository from "./interfaces/IHashtagRepository";
import { Hashtags } from "../../database/postgresql/models/Hashtags";
import { getRepository } from "typeorm";
import type { getHashtagType } from "../../modules/content-service/types";
import { searchHashtagType } from "../../modules/search-service/types";

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
     * Get a hashtag record by db field name.
     * @param input: string
     * @param field: string
     * @returns Promise<getHashtagType>
     */
    async getBy(input: string, field: string): Promise<getHashtagType> {

        return new Promise(async (resolve, reject) => {
            const hashtag = await getRepository(Hashtags)
                .createQueryBuilder('hashtags')
                .select('hashtags')
                .where(`${field} = :input`, { input })
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

    /**
     * Search hashtag by name.
     * @param searchText: string
     * @returns Promise<searchHashtagType[]>
     */
    search(searchText: string): Promise<searchHashtagType[]> {

        return new Promise(async (resolve, reject) => {

            const searchResult = await getRepository(Hashtags).find({
                where: `"name" ILIKE '%${searchText}%'`,
                take: 20
            }).catch((error) => {
                return reject(error);
            });

            if (searchResult) {
                const newSearchResult = searchResult.map((hashtag) => {
                    return {
                        classification: 'hashtag',
                        hashtagId: hashtag.id || '',
                        name: hashtag.name || ''
                    }
                });

                return resolve(newSearchResult);
            }
        });
    }
}

export default HashtagRepository;