import IUserProfileRepository from "./IUserProfileRepository";
import { searchUserType } from "../../types";
import { getRepository } from "typeorm";
import { UserProfiles } from "../../../database/postgresql/models/UserProfiles";

class UserProfileRepository implements IUserProfileRepository {
    constructor() {}


    /**
     * Search user by name.
     * @param searchText: string
     * @returns Promise<searchUserType[]>
     */
    search(searchText: string): Promise<searchUserType[]> {

        return new Promise(async (resolve, reject) => {

            const searchResult = await getRepository(UserProfiles).find({
                where: `"name" ILIKE '%${searchText}%'`,
                take: 20
            }).catch((error) => {
                return reject(error);
            });

            if (searchResult) {
                const newSearchResult = searchResult.map((user) => {
                    return {
                        classification: 'user',
                        userId: user.user_id || '',
                        name: user.name || '',
                        avatar: user.avatar || '',
                        profileTitle: user.profile_title || '',
                    }
                });
                return resolve(newSearchResult);
            }
        });
    }
}

export default UserProfileRepository;