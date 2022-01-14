import { getRepository, QueryFailedError } from 'typeorm';
import { UserRelationships } from "../../../../database/postgresql/models/UserRelationships";
import IUserRelationshipRepository from "./IUserRelationshipRepository";

class UserRelationshipRepository implements IUserRelationshipRepository {

    constructor() {}

    /**
     * Gets user followers.
     * @param follower: boolean
     * @param userCognitoSub: string
     * @returns Promise<{
     *         user_relationships_id: number,
     *         user_relationships_user_id: string,
     *         user_relationships_following_id: string,
     *         user_relationships_created_at: number,
     *         user_relationships_updated_at: number,
     *         user_relationships_deleted_at: number
     *     }[]>
     */
    get(follower = false, userCognitoSub: string): Promise<{
        user_relationships_id: number,
        user_relationships_user_id: string,
        user_relationships_following_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
    }[]> {
        return new Promise(async (resolve, reject) => {
            // if follower is false we get the user's followers otherwise we get the user's followings.
            const whereClause = (follower)? 'user_id = :userCognitoSub' : 'following_id = :userCognitoSub';

            const userRelationships = await getRepository(UserRelationships)
                .createQueryBuilder('user_relationships')
                .select('user_relationships')
                .where(whereClause, { userCognitoSub })
                .getRawMany()
                .catch((error: QueryFailedError) => {
                   return reject(error);
                });

            if (Array.isArray(userRelationships)) {

                const newUserRelationships = userRelationships.map((userRelationship) => {
                    return {
                        user_relationships_id: userRelationship.user_relationships_id,
                        user_relationships_user_id: userRelationship.user_relationships_user_id,
                        user_relationships_following_id: userRelationship.user_relationships_following_id,
                        user_relationships_created_at: userRelationship.user_relationships_created_at,
                        user_relationships_updated_at: userRelationship.user_relationships_updated_at,
                        user_relationships_deleted_at: userRelationship.user_relationships_deleted_at
                    }
                });

                return resolve(newUserRelationships);
            } else {
                return reject('userRelationships is not array');
            }
        });
    }
}

export default UserRelationshipRepository;