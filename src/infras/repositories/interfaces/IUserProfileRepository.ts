import { InsertResult, UpdateResult } from "typeorm";
import type { userProfileType } from "../../../modules/user-service/types";
import { searchUserType } from "../../../modules/search-service/types";

interface IUserProfileRepository {
    create(item: {userId: string, username: string, email: string, phoneNumber: string, name: string}): Promise<InsertResult>;
    getUserProfileBy(input: string, field: string): Promise<userProfileType>;
    updateUserAvatar(userId: string, avatar: string): Promise<UpdateResult>;
    updateUserProfile(attributes: {}, userId: string): Promise<UpdateResult>;
    updatePrivacyStatus(userId: string, isPublic: boolean): Promise<UpdateResult>;
    search(searchText: string): Promise<searchUserType[]>;
}

export default IUserProfileRepository;