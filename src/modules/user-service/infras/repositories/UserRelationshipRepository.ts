import { getRepository } from 'typeorm';
import { UserRelationships } from "../../../../database/postgresql/models/UserRelationships";
import IUserRelationshipRepository from "./IUserRelationshipRepository";

class UserRelationshipRepository implements IUserRelationshipRepository {

    constructor() {}

    /**
     * Gets user followers.
     * @param follower: boolean
     * @param userCognitoSub: string
     * @returns Promise<any>
     */
    get(follower = false, userCognitoSub: string): Promise<any> {
        // if follower is false we get the user's followers otherwise we get the user's followings.
        const whereClause = (follower)? 'user_id = :userCognitoSub' : 'following_id = :userCognitoSub';

        return getRepository(UserRelationships)
            .createQueryBuilder('user_relationships')
            .select('user_relationships')
            .where(whereClause, { userCognitoSub })
            .getRawMany();
    }
}

export default UserRelationshipRepository;