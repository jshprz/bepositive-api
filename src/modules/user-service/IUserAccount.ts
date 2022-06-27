import { userProfileType } from "./types";
import { ManagedUpload } from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import { ISignUpResult } from "amazon-cognito-identity-js";

interface IUserAccount {

    getUserProfile(userId: string, loggedInUserId: string): Promise<{
        message: string,
        data: userProfileType,
        code: number
    }>;

    updatePrivacyStatus(userCognitoSub: string, isPublic: boolean): Promise<{
        message: string,
        data: {},
        code: number
    }>;

    getUser(sub: string): Promise<{
        username: string,
        sub: string,
        name: string,
        email: string,
        dateCreated: Date,
        dateModified: Date,
        enabled: boolean,
        status: string
    }>;

    getFollowers(userCognitoSub: string): Promise<{
        message: string,
        data: {
            id: string,
            followeeId: string,
            followerId: string,
            createdAt: Date,
            updatedAt: Date,
            deletedAt: Date
        }[],
        code: number
    }>;

    getFollowings(userCognitoSub: string): Promise<{
        message: string,
        data: {
            id: string,
            followeeId: string,
            followerId: string,
            createdAt: Date,
            updatedAt: Date,
            deletedAt: Date
        }[],
        code: number
    }>;

    followUser(followeeCognitoSub: string, followerCognitoSub: string): Promise<{
        message: string,
        data: {},
        code: number
    }>;

    unfollowUser(followeeCognitoSub: string, followerCognitoSub: string): Promise<{
        message: string,
        data: {},
        code: number
    }>;

    uploadProfileAvatar(userId: string, originalName: string, mimeType: string, data: Buffer): Promise<{
        message: string,
        data: SendData,
        code: number
    }>;

    updateNameInCognito(userAttributeList: { Name: string; Value: any; }[], userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }>;

    updateProfile(attributes: any, userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }>;

    register(body: { email: string; name: string; password: string; }): Promise<{
        message: string,
        data: ISignUpResult,
        code: number
    }>;

    verifyUser(body: { email: string, verifyCode: string }): Promise<string>;

    updateEmailVerifiedToTrue(email: string): Promise<boolean>;

    resendAccountConfirmationCode(email: string): Promise<boolean>;

    createUserProfileData(item: {userId: string, email: string, name: string}): Promise<{
        message: string,
        data: {},
        code: number
    }>;

}

export default IUserAccount;