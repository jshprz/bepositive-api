import UserAccountFacade from "../../../../../modules/user-service/facades/UserAccountFacade";
import AwsCognito from "../../../../../modules/user-service/infras/aws/AwsCognito";
import UserRelationshipRepository from "../../../../../modules/user-service/infras/repositories/UserRelationshipRepository";

jest.mock('../../../../../modules/user-service/facades/UserAccountFacade');
jest.mock('../../../../../modules/user-service/infras/aws/AwsCognito');
jest.mock('../../../../../modules/user-service/infras/repositories/UserRelationshipRepository');

const userAccountFacadeMock = UserAccountFacade as jest.MockedClass<typeof UserAccountFacade>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const userRelationshipRepositoryMock = UserRelationshipRepository as jest.MockedClass<typeof UserRelationshipRepository>;

describe('Facades :: UserAccountFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        userAccountFacadeMock.mockClear();
        awsCognitoMock.mockClear();
        userRelationshipRepositoryMock.mockClear();
    });

    it('should call the instance of class UserAccountFacade once', () => {
        const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());
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

    describe(':: getUserProfile', () => {
        describe('#execute', () => {
            it('should call the getUserProfile() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userAccountFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const accessToken = 'accesstoken';

                userAccountFacadeInstance.getUserProfile(accessToken);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getUserProfile).toHaveBeenCalledWith(accessToken);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getUserProfile).toHaveBeenCalledTimes(1);
            });
            it('should return getUserProfile object', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(userAccountFacadeInstance, 'getUserProfile').mockImplementation(() => {
                    const result = {
                        "Username": "a442d70f-53e1-4b6b-84a4-b76589d74772",
                        "UserAttributes": [
                            {
                                "Name": "sub",
                                "Value": "a442d70f-53e1-4b6b-84a4-b76589d74772"
                            },
                            {
                                "Name": "email_verified",
                                "Value": "true"
                            },
                            {
                                "Name": "name",
                                "Value": "Joshua Perez"
                            },
                            {
                                "Name": "email",
                                "Value": "joshuaperezmelgazo@gmail.com"
                            }
                        ]
                    };

                    return result;
                });

                const accessToken = 'accesstoken';
                const getUserProfileReturnData = {
                    "Username": "a442d70f-53e1-4b6b-84a4-b76589d74772",
                    "UserAttributes": [
                        {
                            "Name": "sub",
                            "Value": "a442d70f-53e1-4b6b-84a4-b76589d74772"
                        },
                        {
                            "Name": "email_verified",
                            "Value": "true"
                        },
                        {
                            "Name": "name",
                            "Value": "Joshua Perez"
                        },
                        {
                            "Name": "email",
                            "Value": "joshuaperezmelgazo@gmail.com"
                        }
                    ]
                };

                expect(typeof userAccountFacadeInstance.getUserProfile(accessToken)).toBe('object');
                expect(userAccountFacadeInstance.getUserProfile(accessToken)).toStrictEqual(getUserProfileReturnData);
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

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const sub = 'sub test';

                userAccountFacadeInstance.getUser(sub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getUser).toHaveBeenCalledWith(sub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getUser).toHaveBeenCalledTimes(1);
            });
            it('should return getUser object', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());

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

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountFacadeInstance.getFollowers(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getFollowers).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getFollowers).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowers array', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());

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

                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());
                expect(userAccountFacadeMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'test user cognito sub';

                userAccountFacadeInstance.getFollowings(userCognitoSub);

                // To make sure that we call the function with the expected arguments:
                expect(userAccountFacadeMock.prototype.getFollowings).toHaveBeenCalledWith(userCognitoSub);

                // To make sure we called the function once:
                expect(userAccountFacadeMock.prototype.getFollowings).toHaveBeenCalledTimes(1);
            });
            it('should return getFollowings array', () => {
                const userAccountFacadeInstance = new UserAccountFacade(new AwsCognito(), new UserRelationshipRepository());

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
});