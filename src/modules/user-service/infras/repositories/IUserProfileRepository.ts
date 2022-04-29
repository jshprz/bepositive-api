import {InsertResult, UpdateResult} from "typeorm";
import {UserProfiles} from "../../../../database/postgresql/models/UserProfiles";

interface IUserProfileRepository {
    create(item: {userId: string, email: string, name: string}): Promise<InsertResult>;
    getUserProfileByEmail(email: string): Promise<UserProfiles | number>;
    getUserProfileByUserId(userId: string): Promise<UserProfiles>;
    updateUserAvatar(userId: string, avatar: string): Promise<UpdateResult>;
    updateUserProfile(attributes: {}, userId: string): Promise<UpdateResult>;
    updatePrivacyStatus(userId: string, isPublic: boolean): Promise<UpdateResult>;
}

export default IUserProfileRepository;