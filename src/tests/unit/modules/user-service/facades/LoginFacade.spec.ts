import LoginFacade from "../../../../../modules/user-service/facades/LoginFacade";
import AwsCognito from "../../../../../modules/user-service/infras/aws/AwsCognito";
import AccessTokenRepository from "../../../../../modules/user-service/infras/repositories/AccessTokenRepository";

jest.mock('../../../../../modules/user-service/infras/aws/AwsCognito');
jest.mock('../../../../../modules/user-service/infras/repositories/AccessTokenRepository');
jest.mock('../../../../../modules/user-service/facades/LoginFacade');

const loginFacadeMock = LoginFacade as jest.MockedClass<typeof LoginFacade>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const accessTokenRepositoryMock = AccessTokenRepository as jest.MockedClass<typeof AccessTokenRepository>;

describe('Facades :: LoginFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        loginFacadeMock.mockClear();
        awsCognitoMock.mockClear();
        accessTokenRepositoryMock.mockClear();
    });
    it('should call the instance of dependency AwsCognito once', () => {
        const awsCognitoInstance = new AwsCognito();
        expect(awsCognitoMock).toHaveBeenCalledTimes(1);
    });
    it('should call the instance of dependency AccessTokenRepository once', () => {
        const accessTokenRepositoryInstance = new AccessTokenRepository();
        expect(accessTokenRepositoryMock).toHaveBeenCalledTimes(1);
    });
    it('should call the instance of class LoginFacade once', () => {
        const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());
        expect(loginFacadeMock).toHaveBeenCalledTimes(1);
    });
    describe(':: normalLogin', () => {
        describe('#execute', () => {
            it('should call the normalLogin() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(loginFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());
                expect(loginFacadeMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const normalLoginArgs = {
                    email: 'test',
                    password: 'test'
                };

                loginFacadeInstance.normalLogin(normalLoginArgs);

                // To make sure that we call the function with the expected arguments:
                expect(loginFacadeMock.prototype.normalLogin).toHaveBeenCalledWith(normalLoginArgs);

                // To make sure we called the function once:
                expect(loginFacadeMock.prototype.normalLogin).toHaveBeenCalledTimes(1);
            });

            it('should return user authentication details', () => {
                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(loginFacadeInstance, 'normalLogin').mockImplementation(() => {
                    const normalLoginReturnData = {
                        idToken: {
                            payload: {
                                sub: 'test',
                                name: 'test',
                                email_verified: false,
                                email: 'test',
                                exp: 'test'
                            }
                        },
                        accessToken: {
                            jwtToken: 'test',
                            payload: {
                                exp: 123
                            }
                        }
                    };

                    return normalLoginReturnData;
                });

                const normalLoginArgs = {
                    email: 'test',
                    password: 'test'
                };

                const normalLoginReturnData = {
                    idToken: {
                        payload: {
                            sub: 'test',
                            name: 'test',
                            email_verified: false,
                            email: 'test',
                            exp: 'test'
                        }
                    },
                    accessToken: {
                        jwtToken: 'test',
                        payload: {
                            exp: 123
                        }
                    }
                };

                expect(loginFacadeInstance.normalLogin(normalLoginArgs)).toStrictEqual(normalLoginReturnData);
            });
        });
    });

    describe(':: logout', () => {
        describe('#execute', () => {
            it('should call the logout() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(loginFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());
                expect(loginFacadeMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const req: any = {
                    session: {}
                };

                loginFacadeInstance.logout(req);

                // To make sure that we call the function with the expected arguments:
                expect(loginFacadeMock.prototype.logout).toHaveBeenCalledWith(req);

                // To make sure we called the function once:
                expect(loginFacadeMock.prototype.logout).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(loginFacadeInstance, 'logout').mockImplementation(() => {
                    return true;
                });

                const req: any = {
                    session: {}
                };

                expect(loginFacadeInstance.logout(req)).toStrictEqual(true);
            });
        });
    });

    describe(':: createAccessTokenItem', () => {
        describe('#execute', () => {
            it('should call the createAccessTokenItem() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(loginFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());
                expect(loginFacadeMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const accessToken = 'test';
                const email = 'test@test.com';

                loginFacadeInstance.createAccessTokenItem(accessToken, email);

                // To make sure that we call the function with the expected arguments:
                expect(loginFacadeMock.prototype.createAccessTokenItem).toHaveBeenCalledWith(accessToken, email);

                // To make sure we called the function once:
                expect(loginFacadeMock.prototype.createAccessTokenItem).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(loginFacadeInstance, 'createAccessTokenItem').mockImplementation(() => {
                    return true;
                });

                const accessToken = 'test';
                const email = 'test@test.com';

                expect(loginFacadeInstance.createAccessTokenItem(accessToken, email)).toStrictEqual(true);
            });
        });
    });

    describe(':: deleteAccessTokenItem', () => {
        describe('#execute', () => {
            it('should call the deleteAccessTokenItem() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(loginFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());
                expect(loginFacadeMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const email = 'test@test.com';

                loginFacadeInstance.deleteAccessTokenItem(email);

                // To make sure that we call the function with the expected arguments:
                expect(loginFacadeMock.prototype.deleteAccessTokenItem).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(loginFacadeMock.prototype.deleteAccessTokenItem).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const loginFacadeInstance = new LoginFacade(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(loginFacadeInstance, 'deleteAccessTokenItem').mockImplementation(() => {
                    return true;
                });

                const email = 'test@test.com';

                expect(loginFacadeInstance.deleteAccessTokenItem(email)).toStrictEqual(true);
            });
        });
    });
});