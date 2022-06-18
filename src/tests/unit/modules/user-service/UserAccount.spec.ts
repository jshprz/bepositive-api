import UserAccount from "../../../../modules/user-service/UserAccount";
import AwsCognito from "../../../../infras/aws/AwsCognito";
import UserRelationshipRepository from "../../../../infras/repositories/UserRelationshipRepository";
import AwsS3 from "../../../../infras/aws/AwsS3";
import UserProfileRepository from "../../../../infras/repositories/UserProfileRepository";

jest.mock('../../../../modules/user-service/UserAccount');
jest.mock('../../../../infras/aws/AwsCognito');
jest.mock('../../../../infras/repositories/UserRelationshipRepository');
jest.mock('../../../../infras/aws/AwsS3');
jest.mock('../../../../infras/repositories/UserProfileRepository');

const userAccountMock = UserAccount as jest.MockedClass<typeof UserAccount>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const userRelationshipRepositoryMock = UserRelationshipRepository as jest.MockedClass<typeof UserRelationshipRepository>;
const awsS3Mock = AwsS3 as jest.MockedClass<typeof AwsS3>;
const userProfileRepositoryMock = UserProfileRepository as jest.MockedClass<typeof UserProfileRepository>;

describe('Facades :: UserAccountFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        userAccountMock.mockClear();
        awsCognitoMock.mockClear();
        userRelationshipRepositoryMock.mockClear();
        awsS3Mock.mockClear();
        userProfileRepositoryMock.mockClear();
    });

    it('should call the instance of class UserAccountFacade once', () => {
        const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
        expect(userAccountMock).toHaveBeenCalledTimes(1);
    });

    it('should call the instance of dependency AwsCognito once', () => {
        const awsCognitoInstance = new AwsCognito();
        expect(awsCognitoMock).toHaveBeenCalledTimes(1);
    });

    it('should call the instance of class UserRelationshipRepository once', () => {
        const userRelationshipRepositoryInstance = new UserRelationshipRepository();
        expect(userRelationshipRepositoryMock).toHaveBeenCalledTimes(1);
    });

    it('should call the instance of dependency AwsS3 once', () => {
        const awsS3Instance = new AwsS3();
        expect(awsS3Mock).toHaveBeenCalledTimes(1);
    });

    it('should call the instance of dependency UserProfileRepository once', () => {
        const userProfileRepositoryInstance = new UserProfileRepository();
        expect(userProfileRepositoryMock).toHaveBeenCalledTimes(1);
    });

    describe(':: getUserProfile', () => {
        describe('#execute', () => {
            it('should call the getUserProfile() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const userId = '87d28326-6ce8-4f68-a30e-dc7cf84df9b7';

                userAccountInstance.getUserProfile(userId);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.getUserProfile).toHaveBeenCalledWith(userId);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.getUserProfile).toHaveBeenCalledTimes(1);
            });
            it('should return expected object data', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'getUserProfile').mockImplementation(() => {
                    const userProfileData = {
                        id: 9,
                        userId: 'f2d5dac1-4a1e-430f-83a2-f339f09ded51',
                        email: 'whatthejoshuaperez@gmail.com',
                        name: 'Gustavo Fring',
                        avatar: 'https://bepositive-dev.s3.amazonaws.com/avatars/1648009690_101523265_2604149099854983_3421364715996053504_n.jpg',
                        gender: 'male',
                        profileTitle: 'test',
                        profileDescription: 'test',
                        dateOfBirth: 'test',
                        website: 'test',
                        city: 'test',
                        state: 'test',
                        zipcode: 'test',
                        country: 'test',
                        phoneNumber: 'test',
                        createdAt: '2022-03-23T04:23:20.968Z',
                        updatedAt: '2022-03-23T04:28:12.328Z'
                    }

                    return {
                        message: 'User profile successfully retrieved',
                        data: userProfileData,
                        code: 200
                    }
                });

                const userId = '87d28326-6ce8-4f68-a30e-dc7cf84df9b7';
                const getUserProfileReturnData = {
                    id: 9,
                    userId: 'f2d5dac1-4a1e-430f-83a2-f339f09ded51',
                    email: 'whatthejoshuaperez@gmail.com',
                    name: 'Gustavo Fring',
                    avatar: 'https://bepositive-dev.s3.amazonaws.com/avatars/1648009690_101523265_2604149099854983_3421364715996053504_n.jpg',
                    gender: 'male',
                    profileTitle: 'test',
                    profileDescription: 'test',
                    dateOfBirth: 'test',
                    website: 'test',
                    city: 'test',
                    state: 'test',
                    zipcode: 'test',
                    country: 'test',
                    phoneNumber: 'test',
                    createdAt: '2022-03-23T04:23:20.968Z',
                    updatedAt: '2022-03-23T04:28:12.328Z'
                }

                expect(typeof userAccountInstance.getUserProfile(userId)).toBe('object');
                expect(userAccountInstance.getUserProfile).toHaveBeenCalledWith('87d28326-6ce8-4f68-a30e-dc7cf84df9b7');
                expect(userAccountInstance.getUserProfile(userId)).toStrictEqual({
                    message: 'User profile successfully retrieved',
                    data: getUserProfileReturnData,
                    code: 200
                });
            });
        });
    });

    describe(':: getUser', () => {
        describe('#execute', () => {
            it('should call the getUser() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const sub = 'sub test';

                userAccountInstance.getUser(sub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.getUser).toHaveBeenCalledWith(sub);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.getUser).toHaveBeenCalledTimes(1);
            });
            it('should return getUser object', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'getUser').mockImplementation(() => {
                    const result = {
                        username: 'test',
                        sub: 'test',
                        email_verified: true,
                        name: 'test',
                        email: 'test@test.com',
                        dateCreated: new Date().getDate(),
                        dateModified: new Date().getDate(),
                        enabled: true,
                        status: 'test'
                    }

                    return result;
                });

                const sub = 'sub test';
                const getUserReturnData = {
                    username: 'test',
                    sub: 'test',
                    email_verified: true,
                    name: 'test',
                    email: 'test@test.com',
                    dateCreated: new Date().getDate(),
                    dateModified: new Date().getDate(),
                    enabled: true,
                    status: 'test'
                };

                expect(Object.entries(userAccountInstance.getUser(sub)).length).toStrictEqual(9);
                expect(Object.entries(userAccountInstance.getUser(sub))[0]).toStrictEqual(['username', 'test']);
                expect(Object.entries(userAccountInstance.getUser(sub))[1]).toStrictEqual(['sub', 'test']);
                expect(Object.entries(userAccountInstance.getUser(sub))[2]).toStrictEqual(['email_verified', true]);
                expect(Object.entries(userAccountInstance.getUser(sub))[3]).toStrictEqual(['name', 'test']);
                expect(Object.entries(userAccountInstance.getUser(sub))[4]).toStrictEqual(['email', 'test@test.com']);
                expect(Object.entries(userAccountInstance.getUser(sub))[5]).toStrictEqual(['dateCreated', new Date().getDate()]);
                expect(Object.entries(userAccountInstance.getUser(sub))[6]).toStrictEqual(['dateModified', new Date().getDate()]);
                expect(Object.entries(userAccountInstance.getUser(sub))[7]).toStrictEqual(['enabled', true]);
                expect(Object.entries(userAccountInstance.getUser(sub))[8]).toStrictEqual(['status', 'test']);

                expect(typeof userAccountInstance.getUser(sub)).toBe('object');
                expect(userAccountInstance.getUser(sub)).toStrictEqual(getUserReturnData);
            });
        });
    });

    describe(':: getFollowers', () => {
        describe('#execute', () => {
            it('should call the getFollowers() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountInstance.getFollowers(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.getFollowers).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.getFollowers).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowers array', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'getFollowers').mockImplementation(() => {
                    const result = [{
                        message: 'test message',
                        data: {
                            user_relationships_id: 1,
                            user_relationships_user_id: 'test',
                            user_relationships_following_id: 'test',
                            user_relationships_created_at: 1,
                            user_relationships_updated_at: 1,
                            user_relationships_deleted_at: 1
                        },
                        code: 200
                    }];

                    return result;
                });

                const userCognitoSub = 'test user cognito sub';
                const getFollowersReturnData = [{
                    message: 'test message',
                    data: {
                        user_relationships_id: 1,
                        user_relationships_user_id: 'test',
                        user_relationships_following_id: 'test',
                        user_relationships_created_at: 1,
                        user_relationships_updated_at: 1,
                        user_relationships_deleted_at: 1
                    },
                    code: 200
                }];

                expect(Array.isArray(userAccountInstance.getFollowers(userCognitoSub))).toBe(true);
                expect(userAccountInstance.getFollowers(userCognitoSub)).toStrictEqual(getFollowersReturnData);
            });
        });
    });

    describe(':: getFollowings', () => {
        describe('#execute', () => {
            it('should call the getFollowings() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountInstance.getFollowings(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.getFollowings).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.getFollowings).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowings array', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'getFollowings').mockImplementation(() => {
                    const result = [{
                        message: 'test message',
                        data: {
                            user_relationships_id: 1,
                            user_relationships_user_id: 'test',
                            user_relationships_following_id: 'test',
                            user_relationships_created_at: 1,
                            user_relationships_updated_at: 1,
                            user_relationships_deleted_at: 1
                        },
                        code: 200
                    }];

                    return result;
                });

                const userCognitoSub = 'test user cognito sub';
                const getFollowingsReturnData = [{
                    message: 'test message',
                    data: {
                        user_relationships_id: 1,
                        user_relationships_user_id: 'test',
                        user_relationships_following_id: 'test',
                        user_relationships_created_at: 1,
                        user_relationships_updated_at: 1,
                        user_relationships_deleted_at: 1
                    },
                    code: 200
                }];

                expect(Array.isArray(userAccountInstance.getFollowings(userCognitoSub))).toBe(true);
                expect(userAccountInstance.getFollowings(userCognitoSub)).toStrictEqual(getFollowingsReturnData);
            });
        });
    });

    describe(':: followUserById', () => {
        describe('#execute', () => {
            it('should call the followUserById() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const followeeCognitoSub: string = 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b';
                const followerCognitoSub: string = 'a442d70f-53e1-4b6b-84a4-b76589d74772';

                userAccountInstance.followUser(followeeCognitoSub, followerCognitoSub);

                expect(userAccountMock.prototype.followUser).toHaveBeenCalledWith('ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b', 'a442d70f-53e1-4b6b-84a4-b76589d74772');
                expect(userAccountMock.prototype.followUser).toHaveBeenCalledTimes(1);
            });

            it('should return a resolved promise with expected object', async () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                jest.spyOn(userAccountInstance, 'followUser').mockImplementation((followeeUserCognitoSub: string, followerUserCognitoSub: string) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                           message: `${followeeUserCognitoSub} successfully followed by ${followerUserCognitoSub}`,
                           data: {},
                           code: 201
                       })
                    });
                });

                const followeeCognitoSub: string = 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b';
                const followerCognitoSub: string = 'a442d70f-53e1-4b6b-84a4-b76589d74772';

                await expect(userAccountInstance.followUser(followeeCognitoSub, followerCognitoSub)).resolves.toEqual({
                    'code': 201,
                    'data': {},
                    'message': 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b successfully followed by a442d70f-53e1-4b6b-84a4-b76589d74772'
                });
            });
        });
    });

    describe(':: register', () => {
        describe('#execute', () => {
            it('should call the register() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const body = {
                    email: 'test@test.com',
                    name: 'Test',
                    password: 'Test'
                }

                userAccountInstance.register(body);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.register).toHaveBeenCalledWith(body);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.register).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                const body = {
                    email: 'test@test.com',
                    name: 'Test',
                    password: 'Test'
                };
                const registerResultData = {
                    "user": {
                        "username": "test@test.com",
                        "pool": {
                            "userPoolId": "ap-southeast-2_D9dCd7oyT",
                            "clientId": "3ho3h3hgpqne342u2us7puv6io",
                            "client": {
                                "endpoint": "https://cognito-idp.ap-southeast-2.amazonaws.com/",
                                "fetchOptions": {}
                            },
                            "advancedSecurityDataCollectionFlag": true
                        },
                        "Session": null,
                        "client": {
                            "endpoint": "https://cognito-idp.ap-southeast-2.amazonaws.com/",
                            "fetchOptions": {}
                        },
                        "signInUserSession": null,
                        "authenticationFlowType": "USER_SRP_AUTH",
                        "keyPrefix": "CognitoIdentityServiceProvider.3ho3h3hgpqne342u2us7puv6io",
                        "userDataKey": "CognitoIdentityServiceProvider.3ho3h3hgpqne342u2us7puv6io.test@test.com.userData"
                    },
                    "userConfirmed": false,
                    "userSub": "1077f0e1-3015-4b07-916d-86379883e57b",
                    "codeDeliveryDetails": {
                        "AttributeName": "email",
                        "DeliveryMedium": "EMAIL",
                        "Destination": "t***@t***"
                    }
                }
                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'register').mockImplementation(() => {

                    return registerResultData;
                });

                expect(typeof userAccountInstance.register(body)).toBe(typeof registerResultData);
                expect(userAccountInstance.register(body)).toStrictEqual(registerResultData);
            });
        });
    });

    describe(':: verifyUser', () => {
        describe('#execute', () => {
            it('should call the verifyUser() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const body = {
                    email: 'test@test.com',
                    verifyCode: '1234'
                };
                userAccountInstance.verifyUser(body);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.verifyUser).toHaveBeenCalledWith(body);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.verifyUser).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'verifyUser').mockImplementation(() => {
                    const result = 'test';

                    return result;
                });

                const body = {
                    email: 'test@test.com',
                    verifyCode: '1234'
                };
                const verifyUserReturnData = 'test';

                expect(typeof userAccountInstance.verifyUser(body)).toBe('string');
                expect(userAccountInstance.verifyUser(body)).toStrictEqual(verifyUserReturnData);
            });
        });
    });

    describe(':: updateEmailVerifiedToTrue', () => {
        describe('#execute', () => {
            it('should call the updateEmailVerifiedToTrue() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const email = 'test@test.com';
                userAccountInstance.updateEmailVerifiedToTrue(email);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.updateEmailVerifiedToTrue).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.updateEmailVerifiedToTrue).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'updateEmailVerifiedToTrue').mockImplementation(() => {
                    const result = true;

                    return result;
                });

                const email = 'test@test.com';
                const updateEmailVerifiedToTrueReturnData = true;

                expect(typeof userAccountInstance.updateEmailVerifiedToTrue(email)).toBe('boolean');
                expect(userAccountInstance.updateEmailVerifiedToTrue(email)).toStrictEqual(updateEmailVerifiedToTrueReturnData);
            });
        });
    });

    describe(':: resendAccountConfirmationCode', () => {
        describe('#execute', () => {
            it('should call the resendAccountConfirmationCode() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountMock).toHaveBeenCalledTimes(1);

                const email = 'test@test.com';
                userAccountInstance.resendAccountConfirmationCode(email);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountMock.prototype.resendAccountConfirmationCode).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(userAccountMock.prototype.resendAccountConfirmationCode).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const userAccountInstance = new UserAccount(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountInstance, 'resendAccountConfirmationCode').mockImplementation(() => {
                    const result = true;

                    return result;
                });

                const email = 'test@test.com';
                const resendAccountConfirmationCodeReturnData = true;

                expect(typeof userAccountInstance.resendAccountConfirmationCode(email)).toBe('boolean');
                expect(userAccountInstance.resendAccountConfirmationCode(email)).toStrictEqual(resendAccountConfirmationCodeReturnData);
            });
        });
    });
});