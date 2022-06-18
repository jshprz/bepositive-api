import Authentication from "../../../../modules/user-service/Authentication";
import AwsCognito from "../../../../infras/aws/AwsCognito";
import AccessTokenRepository from "../../../../infras/repositories/AccessTokenRepository";

jest.mock('../../../../infras/aws/AwsCognito');
jest.mock('../../../../infras/repositories/AccessTokenRepository');
jest.mock('../../../../modules/user-service/Authentication');

const authenticationMock = Authentication as jest.MockedClass<typeof Authentication>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const accessTokenRepositoryMock = AccessTokenRepository as jest.MockedClass<typeof AccessTokenRepository>;

describe('Facades :: LoginFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        authenticationMock.mockClear();
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
        const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());
        expect(authenticationMock).toHaveBeenCalledTimes(1);
    });
    describe(':: normalLogin', () => {
        describe('#execute', () => {
            it('should call the normalLogin() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(authenticationMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());
                expect(authenticationMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const normalLoginArgs = {
                    email: 'test',
                    password: 'test'
                };

                authenticationInstance.normalLogin(normalLoginArgs);

                // To make sure that we call the function with the expected arguments:
                expect(authenticationMock.prototype.normalLogin).toHaveBeenCalledWith(normalLoginArgs);

                // To make sure we called the function once:
                expect(authenticationMock.prototype.normalLogin).toHaveBeenCalledTimes(1);
            });

            it('should return user authentication details', () => {
                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(authenticationInstance, 'normalLogin').mockImplementation(() => {
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

                expect(authenticationInstance.normalLogin(normalLoginArgs)).toStrictEqual(normalLoginReturnData);
            });
        });
    });

    describe(':: logout', () => {
        describe('#execute', () => {
            it('should call the logout() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(authenticationMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());
                expect(authenticationMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const req: any = {
                    session: {}
                };

                authenticationInstance.logout(req);

                // To make sure that we call the function with the expected arguments:
                expect(authenticationMock.prototype.logout).toHaveBeenCalledWith(req);

                // To make sure we called the function once:
                expect(authenticationMock.prototype.logout).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(authenticationInstance, 'logout').mockImplementation(() => {
                    return true;
                });

                const req: any = {
                    session: {}
                };

                expect(authenticationInstance.logout(req)).toStrictEqual(true);
            });
        });
    });

    describe(':: createAccessTokenItem', () => {
        describe('#execute', () => {
            it('should call the createAccessTokenItem() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(authenticationMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());
                expect(authenticationMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const accessToken = 'test';
                const email = 'test@test.com';

                authenticationInstance.createAccessTokenItem(accessToken, email);

                // To make sure that we call the function with the expected arguments:
                expect(authenticationMock.prototype.createAccessTokenItem).toHaveBeenCalledWith(accessToken, email);

                // To make sure we called the function once:
                expect(authenticationMock.prototype.createAccessTokenItem).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(authenticationInstance, 'createAccessTokenItem').mockImplementation(() => {
                    return true;
                });

                const accessToken = 'test';
                const email = 'test@test.com';

                expect(authenticationInstance.createAccessTokenItem(accessToken, email)).toStrictEqual(true);
            });
        });
    });

    describe(':: deleteAccessTokenItem', () => {
        describe('#execute', () => {
            it('should call the deleteAccessTokenItem() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(authenticationMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());
                expect(authenticationMock).toHaveBeenCalledTimes(1); // Just to make sure that we call this class once

                const email = 'test@test.com';

                authenticationInstance.deleteAccessTokenItem(email);

                // To make sure that we call the function with the expected arguments:
                expect(authenticationMock.prototype.deleteAccessTokenItem).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(authenticationMock.prototype.deleteAccessTokenItem).toHaveBeenCalledTimes(1);
            });

            it('should return a boolean true', () => {
                const authenticationInstance = new Authentication(new AwsCognito(), new AccessTokenRepository());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(authenticationInstance, 'deleteAccessTokenItem').mockImplementation(() => {
                    return true;
                });

                const email = 'test@test.com';

                expect(authenticationInstance.deleteAccessTokenItem(email)).toStrictEqual(true);
            });
        });
    });
});