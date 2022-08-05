import IUserProfileRepository from "./IUserProfileRepository";
import { getConnection, getRepository, InsertResult, QueryFailedError, UpdateResult } from "typeorm";
import { UserProfiles } from "../../database/postgresql/models/UserProfiles";
import type { userProfileType } from "../../modules/user-service/types";

class UserProfileRepository implements IUserProfileRepository {
    constructor() {}

    /**
     * Create user profile data.
     * @param item: {userId: string, email: string, name: string}
     * @returns Promise<InsertResult>
     */
    create(item: {userId: string, username: string, email: string, phoneNumber: string, name: string}): Promise<InsertResult> {

        return getConnection()
            .createQueryBuilder()
            .insert()
            .into(UserProfiles)
            .values([{
                user_id: item.userId,
                username: item.username,
                email: item.email,
                name: item.name,
                phone_number: item.phoneNumber
            }]).execute();
    }

    /**
     * Get the user profile.
     * @param input: string
     * @param field: string
     * @returns Promise<userProfileType>
     */
    getUserProfileBy(input: string, field: string): Promise<userProfileType> {

        return new Promise(async (resolve, reject) => {

            const userProfile = await getRepository(UserProfiles)
                .createQueryBuilder('user_profiles')
                .select('user_profiles')
                .where(`${field} = :input`, { input })
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            const newUserProfile = {
                id: userProfile?.id || '',
                userId: userProfile?.user_id || '',
                username: userProfile?.username || '',
                email: userProfile?.email || '',
                name: userProfile?.name || '',
                avatar: userProfile?.avatar || '',
                gender: userProfile?.gender || '',
                profileTitle: userProfile?.profile_title || '',
                profileDescription: userProfile?.profile_description || '',
                dateOfBirth: userProfile?.date_of_birth || '',
                website: userProfile?.website || '',
                city: userProfile?.city || '',
                state: userProfile?.state || '',
                zipcode: userProfile?.zipcode || '',
                country: userProfile?.country || '',
                phoneNumber: userProfile?.phone_number || '',
                isPublic: userProfile?.is_public || false,
                isFollowed: false,
                createdAt: userProfile?.created_at || 0,
                updatedAt: userProfile?.updated_at || 0,
            };

            return resolve(newUserProfile);
        });
    }

    /**
     * Update the user avatar.
     * @param userId: string
     * @param avatar: string
     * @returns Promise<UpdateResult>
     */
    updateUserAvatar(userId: string, avatar: string): Promise<UpdateResult> {

        return getRepository(UserProfiles)
            .createQueryBuilder('user_profiles')
            .update(UserProfiles)
            .set({
                avatar
            })
            .where('user_id = :userId', {userId})
            .execute();
    }

    /**
     * Update User Profile
     * @params attributes: {}
     * @params userId: string
     * @returns Promise<UpdateResult>
     */
    updateUserProfile(attributes: {}, userId: string): Promise<UpdateResult> {
        return getRepository(UserProfiles)
            .createQueryBuilder('user_profiles')
            .update(UserProfiles)
            .set(attributes)
            .where('user_id = :userId', {userId})
            .execute();
    }

     /*
     * Update the user privacy setting.
     * @param userId: string
     * @param isPublic: boolean
     * @returns Promise<UpdateResult>
     */
    updatePrivacyStatus(userId: string, isPublic: boolean): Promise<UpdateResult> {
        return getRepository(UserProfiles)
        .createQueryBuilder('user_profiles')
        .update(UserProfiles)
        .set({is_public: isPublic})
        .where('user_id = :userId', {userId})
        .execute();
    }
}

export default UserProfileRepository;