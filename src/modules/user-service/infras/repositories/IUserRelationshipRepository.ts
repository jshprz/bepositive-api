import { UserRelationships } from "../../../../database/postgresql/models/UserRelationships";

type userRelationshipTypes = {
    id: number,
    followeeId: string,
    followerId: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
}

interface IUserRelationshipRepository {
    create(followeeCognitoSub: string, followerCognitoSub: string): UserRelationships;
    get(byFollower: boolean, userCognitoSub: string): Promise<userRelationshipTypes[]>;
    getByFolloweeIdAndFollowerId(followeeCognitoSub: string, followerCognitoSub: string): Promise<userRelationshipTypes[]>;
    softDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean>;
    restoreSoftDelete(followeeCognitoSub: string, followerCognitoSub: string): Promise<boolean>;
}

export default IUserRelationshipRepository;