import { getRepository, QueryFailedError } from 'typeorm';
import { UserRelationships } from "../../database/postgresql/models/UserRelationships";
import IUserRelationshipRepository from "./IUserRelationshipRepository";
import type { userRelationshipTypes } from '../../modules/user-service/types';

class UserRelationshipRepository implements IUserRelationshipRepository {
    private readonly _model;

    constructor() {
        this._model = new UserRelationships();
    }

    /**
     * Create user relationship record in the database.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns instance of UserRelationships
     */
    create(followeeCognitoSub: string, followerCognitoSub: string): UserRelationships {
        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.followee_id = followeeCognitoSub;
        this._model.follower_id = followerCognitoSub;

        return this._model;
    }

    /**
     * Gets user followers.
     * @param follower: boolean
     * @param userCognitoSub: string
     * @returns Promise<userRelationshipTypes[]>
     */
    get(byFollower = false, userCognitoSub: string): Promise<userRelationshipTypes[]> {
        return new Promise(async (resolve, reject) => {
            // if byFollower is true we get the user's followers otherwise we get the user's followings.
            const whereClause = (byFollower)? 'follower_id = :userCognitoSub' : 'followee_id = :userCognitoSub';

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
                        id: userRelationship.user_relationships_id,
                        followeeId: userRelationship.user_relationships_followee_id,
                        followerId: userRelationship.user_relationships_follower_id,
                        createdAt: userRelationship.user_relationships_created_at,
                        updatedAt: userRelationship.user_relationships_updated_at,
                        deletedAt: userRelationship.user_relationships_deleted_at
                    }
                });

                return resolve(newUserRelationships);
            } else {
                return reject('userRelationships is not array');
            }
        });
    }


    /**
     * To get a record in user_relationships table by followee id and follower id.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns Promise<userRelationshipTypes[]>
     */
    getByFolloweeIdAndFollowerId(followeeCognitoSub: string, followerCognitoSub: string): Promise<userRelationshipTypes[]> {
        return new Promise(async (resolve, reject) => {

            const userRelationships = await getRepository(UserRelationships)
                .createQueryBuilder('user_relationships')
                .select('user_relationships')
                .where('followee_id = :followeeCognitoSub', { followeeCognitoSub })
                .andWhere('follower_id = :followerCognitoSub', { followerCognitoSub })
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (Array.isArray(userRelationships)) {

                const newUserRelationships = userRelationships.map((userRelationship) => {
                    return {
                        id: userRelationship.user_relationships_id,
                        followeeId: userRelationship.user_relationships_followee_id,
                        followerId: userRelationship.user_relationships_follower_id,
                        createdAt: userRelationship.user_relationships_created_at,
                        updatedAt: userRelationship.user_relationships_updated_at,
                        deletedAt: userRelationship.user_relationships_deleted_at
                    }
                });

                return resolve(newUserRelationships);
            } else {
                return reject('userRelationships is not array');
            }
        });
    }


    /**
     * To perform a soft delete in user_relationships table records.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns Promise<boolean>
     */
    softDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await getRepository(UserRelationships)
                .createQueryBuilder()
                .where('followee_id = :followeeCognitoSub', { followeeCognitoSub })
                .andWhere('follower_id = :followerCognitoSub', { followerCognitoSub })
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            return resolve(true);
        });
    }


    /**
     * To restore the soft deleted records in user_relationships table.
     * @param followeeCognitoSub: string
     * @param followerCognitoSub: string
     * @returns Promise<boolean>
     */
    restoreSoftDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const restoreSoftDelete = await getRepository(UserRelationships)
                .createQueryBuilder()
                .where('followee_id = :followeeCognitoSub', { followeeCognitoSub })
                .andWhere('follower_id = :followerCognitoSub', { followerCognitoSub })
                .restore()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (restoreSoftDelete && typeof restoreSoftDelete.affected === 'number') {
                return resolve((restoreSoftDelete.affected > 0)? true : false);
            } else {
                return reject('Invalid restoreSoftDelete type');
            }
        });
    }
}

export default UserRelationshipRepository;