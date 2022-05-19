import { searchHashtagType } from "../../types";
import { getRepository } from "typeorm";
import IHashtagRepository from "./IHashtagRepository";
import { Hashtags } from "../../../database/postgresql/models/Hashtags";

class HashtagRepository implements IHashtagRepository {
    constructor() {}

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