import UserAccountFacade from "../../../../../modules/user-service/facades/UserAccountFacade";
import AwsCognito from "../../../../../modules/user-service/infras/aws/AwsCognito";
import UserRelationshipRepository from "../../../../../modules/user-service/infras/repositories/UserRelationshipRepository";
import AwsS3 from "../../../../../modules/user-service/infras/aws/AwsS3";
import UserProfileRepository from "../../../../../modules/user-service/infras/repositories/UserProfileRepository";

jest.mock('../../../../../modules/user-service/facades/UserAccountFacade');
jest.mock('../../../../../modules/user-service/infras/aws/AwsCognito');
jest.mock('../../../../../modules/user-service/infras/repositories/UserRelationshipRepository');
jest.mock('../../../../../modules/user-service/infras/aws/AwsS3');
jest.mock('../../../../../modules/user-service/infras/repositories/UserProfileRepository');

const userAccountFacadeMock = UserAccountFacade as jest.MockedClass<typeof UserAccountFacade>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const userRelationshipRepositoryMock = UserRelationshipRepository as jest.MockedClass<typeof UserRelationshipRepository>;
const awsS3Mock = AwsS3 as jest.MockedClass<typeof AwsS3>;
const userProfileRepositoryMock = UserProfileRepository as jest.MockedClass<typeof UserProfileRepository>;

describe('Facades :: UserAccountFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        userAccountFacadeMock.mockClear();
        awsCognitoMock.mockClear();
        userRelationshipRepositoryMock.mockClear();
        awsS3Mock.mockClear();
        userProfileRepositoryMock.mockClear();
    });

    it('should call the instance of class UserAccountFacade once', () => {
        const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
        expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);
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
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const userId = '87d28326-6ce8-4f68-a30e-dc7cf84df9b7';

                userAccountFacadeInstance.getUserProfile(userId);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getUserProfile).toHaveBeenCalledWith(userId);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getUserProfile).toHaveBeenCalledTimes(1);
            });
            it('should return expected object data', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountFacadeInstance, 'getUserProfile').mockImplementation(() => {
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

                expect(typeof userAccountFacadeInstance.getUserProfile(userId)).toBe('object');
                expect(userAccountFacadeInstance.getUserProfile).toHaveBeenCalledWith('87d28326-6ce8-4f68-a30e-dc7cf84df9b7');
                expect(userAccountFacadeInstance.getUserProfile(userId)).toStrictEqual({
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
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const sub = 'sub test';

                userAccountFacadeInstance.getUser(sub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getUser).toHaveBeenCalledWith(sub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getUser).toHaveBeenCalledTimes(1);
            });
            it('should return getUser object', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountFacadeInstance, 'getUser').mockImplementation(() => {
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

                expect(Object.entries(userAccountFacadeInstance.getUser(sub)).length).toStrictEqual(9);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[0]).toStrictEqual(['username', 'test']);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[1]).toStrictEqual(['sub', 'test']);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[2]).toStrictEqual(['email_verified', true]);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[3]).toStrictEqual(['name', 'test']);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[4]).toStrictEqual(['email', 'test@test.com']);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[5]).toStrictEqual(['dateCreated', new Date().getDate()]);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[6]).toStrictEqual(['dateModified', new Date().getDate()]);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[7]).toStrictEqual(['enabled', true]);
                expect(Object.entries(userAccountFacadeInstance.getUser(sub))[8]).toStrictEqual(['status', 'test']);

                expect(typeof userAccountFacadeInstance.getUser(sub)).toBe('object');
                expect(userAccountFacadeInstance.getUser(sub)).toStrictEqual(getUserReturnData);
            });
        });
    });

    describe(':: getFollowers', () => {
        describe('#execute', () => {
            it('should call the getFollowers() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountFacadeInstance.getFollowers(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getFollowers).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getFollowers).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowers array', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountFacadeInstance, 'getFollowers').mockImplementation(() => {
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

                expect(Array.isArray(userAccountFacadeInstance.getFollowers(userCognitoSub))).toBe(true);
                expect(userAccountFacadeInstance.getFollowers(userCognitoSub)).toStrictEqual(getFollowersReturnData);
            });
        });
    });

    describe(':: getFollowings', () => {
        describe('#execute', () => {
            it('should call the getFollowings() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountFacadeInstance.getFollowings(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getFollowings).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getFollowings).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowings array', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountFacadeInstance, 'getFollowings').mockImplementation(() => {
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

                expect(Array.isArray(userAccountFacadeInstance.getFollowings(userCognitoSub))).toBe(true);
                expect(userAccountFacadeInstance.getFollowings(userCognitoSub)).toStrictEqual(getFollowingsReturnData);
            });
        });
    });

    describe(':: followUserById', () => {
        describe('#execute', () => {
            it('should call the followUserById() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const followeeCognitoSub: string = 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b';
                const followerCognitoSub: string = 'a442d70f-53e1-4b6b-84a4-b76589d74772';

                userAccountFacadeInstance.followUser(followeeCognitoSub, followerCognitoSub);

                expect(userAccountFacadeMock.prototype.followUser).toHaveBeenCalledWith('ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b', 'a442d70f-53e1-4b6b-84a4-b76589d74772');
                expect(userAccountFacadeMock.prototype.followUser).toHaveBeenCalledTimes(1);
            });

            it('should return a resolved promise with expected object', async () => {
                // To show that mockClear() is working:
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();
                expect(awsS3Mock).not.toHaveBeenCalled();
                expect(userProfileRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());

                jest.spyOn(userAccountFacadeInstance, 'followUser').mockImplementation((followeeUserCognitoSub: string, followerUserCognitoSub: string) => {
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

                await expect(userAccountFacadeInstance.followUser(followeeCognitoSub, followerCognitoSub)).resolves.toEqual({
                    'code': 201,
                    'data': {},
                    'message': 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b successfully followed by a442d70f-53e1-4b6b-84a4-b76589d74772'
                });
            });
        });
    });
});