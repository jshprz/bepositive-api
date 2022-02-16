import { UserRelationships } from "../../../../database/postgresql/models/UserRelationships";
import {SoftDeleteQueryBuilder} from "typeorm/query-builder/SoftDeleteQueryBuilder";

interface IUserRelationshipRepository {
    create(followeeCognitoSub: string, followerCognitoSub: string): UserRelationships;
    get(follower: boolean, userCognitoSub: string): Promise<{
        user_relationships_id: number,
        user_relationships_followee_id: string,
        user_relationships_follower_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
    }[]>;
    getByFolloweeIdAndFollowerId(followeeCognitoSub: string, followerCognitoSub: string): Promise<{
        user_relationships_id: number,
        user_relationships_followee_id: string,
        user_relationships_follower_id: string,
        user_relationships_created_at: number,
        user_relationships_updated_at: number,
        user_relationships_deleted_at: number
    }[]>;
    softDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean>;
    restoreSoftDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean>;
}

export default IUserRelationshipRepository;