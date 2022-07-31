import { InsertResult, UpdateResult } from "typeorm";
import { UserProfiles } from "../../database/postgresql/models/UserProfiles";
import type { userProfileType } from "../../modules/user-service/types";

interface IUserProfileRepository {
    create(item: {userId: string, username: string, email: string, phoneNumber: string, name: string}): Promise<InsertResult>;
    getUserProfileByEmail(email: string): Promise<userProfileType>;
    getUserProfileByUserId(userId: string): Promise<userProfileType>;
    updateUserAvatar(userId: string, avatar: string): Promise<UpdateResult>;
    updateUserProfile(attributes: {}, userId: string): Promise<UpdateResult>;
    updatePrivacyStatus(userId: string, isPublic: boolean): Promise<UpdateResult>;
}

export default IUserProfileRepository;