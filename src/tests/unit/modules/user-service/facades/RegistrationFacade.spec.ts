import RegistrationFacade from "../../../../../modules/user-service/facades/RegistrationFacade";
import AwsCognito from "../../../../../modules/user-service/infras/aws/AwsCognito";

jest.mock('../../../../../modules/user-service/facades/RegistrationFacade');
jest.mock('../../../../../modules/user-service/infras/aws/AwsCognito');

const registrationFacadeMock = RegistrationFacade as jest.MockedClass<typeof RegistrationFacade>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;

describe('Facades :: RegistrationFacade', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        registrationFacadeMock.mockClear();
        awsCognitoMock.mockClear();
    });

    it('should call the instance of class RegistrationFacade once', () => {
        const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());
        expect(registrationFacadeMock).toHaveBeenCalledTimes(1);
    });

    it('should call the instance of dependency AwsCognito once', () => {
        const awsCognitoInstance = new AwsCognito();
        expect(awsCognitoMock).toHaveBeenCalledTimes(1);
    });

    describe(':: register', () => {
        describe('#execute', () => {
            it('should call the register() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(registrationFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();

                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());
                expect(registrationFacadeMock).toHaveBeenCalledTimes(1);

                const body = {
                    email: 'test@test.com',
                    name: 'Test',
                    password: 'Test'
                }

                registrationFacadeInstance.register(body);

                // To make sure that we call the function with the expected arguments:
                expect(registrationFacadeMock.prototype.register).toHaveBeenCalledWith(body);

                // To make sure we called the function once:
                expect(registrationFacadeMock.prototype.register).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());

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
                jest.spyOn(registrationFacadeInstance, 'register').mockImplementation(() => {

                    return registerResultData;
                });

                expect(typeof registrationFacadeInstance.register(body)).toBe(typeof registerResultData);
                expect(registrationFacadeInstance.register(body)).toStrictEqual(registerResultData);
            });
        });
    });

    describe(':: verifyUser', () => {
        describe('#execute', () => {
            it('should call the verifyUser() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(registrationFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();

                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());
                expect(registrationFacadeMock).toHaveBeenCalledTimes(1);

                const body = {
                    email: 'test@test.com',
                    verifyCode: '1234'
                };
                registrationFacadeInstance.verifyUser(body);

                // To make sure that we call the function with the expected arguments:
                expect(registrationFacadeMock.prototype.verifyUser).toHaveBeenCalledWith(body);

                // To make sure we called the function once:
                expect(registrationFacadeMock.prototype.verifyUser).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(registrationFacadeInstance, 'verifyUser').mockImplementation(() => {
                    const result = 'test';

                    return result;
                });

                const body = {
                    email: 'test@test.com',
                    verifyCode: '1234'
                };
                const verifyUserReturnData = 'test';

                expect(typeof registrationFacadeInstance.verifyUser(body)).toBe('string');
                expect(registrationFacadeInstance.verifyUser(body)).toStrictEqual(verifyUserReturnData);
            });
        });
    });

    describe(':: updateEmailVerifiedToTrue', () => {
        describe('#execute', () => {
            it('should call the updateEmailVerifiedToTrue() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(registrationFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();

                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());
                expect(registrationFacadeMock).toHaveBeenCalledTimes(1);

                const email = 'test@test.com';
                registrationFacadeInstance.updateEmailVerifiedToTrue(email);

                // To make sure that we call the function with the expected arguments:
                expect(registrationFacadeMock.prototype.updateEmailVerifiedToTrue).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(registrationFacadeMock.prototype.updateEmailVerifiedToTrue).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(registrationFacadeInstance, 'updateEmailVerifiedToTrue').mockImplementation(() => {
                    const result = true;

                    return result;
                });

                const email = 'test@test.com';
                const updateEmailVerifiedToTrueReturnData = true;

                expect(typeof registrationFacadeInstance.updateEmailVerifiedToTrue(email)).toBe('boolean');
                expect(registrationFacadeInstance.updateEmailVerifiedToTrue(email)).toStrictEqual(updateEmailVerifiedToTrueReturnData);
            });
        });
    });

    describe(':: resendAccountConfirmationCode', () => {
        describe('#execute', () => {
            it('should call the resendAccountConfirmationCode() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(registrationFacadeMock).not.toHaveBeenCalled();
                expect(awsCognitoMock).not.toHaveBeenCalled();

                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());
                expect(registrationFacadeMock).toHaveBeenCalledTimes(1);

                const email = 'test@test.com';
                registrationFacadeInstance.resendAccountConfirmationCode(email);

                // To make sure that we call the function with the expected arguments:
                expect(registrationFacadeMock.prototype.resendAccountConfirmationCode).toHaveBeenCalledWith(email);

                // To make sure we called the function once:
                expect(registrationFacadeMock.prototype.resendAccountConfirmationCode).toHaveBeenCalledTimes(1);
            });
            it('should return a string', () => {
                const registrationFacadeInstance = new RegistrationFacade(new AwsCognito());

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(registrationFacadeInstance, 'resendAccountConfirmationCode').mockImplementation(() => {
                    const result = true;

                    return result;
                });

                const email = 'test@test.com';
                const resendAccountConfirmationCodeReturnData = true;

                expect(typeof registrationFacadeInstance.resendAccountConfirmationCode(email)).toBe('boolean');
                expect(registrationFacadeInstance.resendAccountConfirmationCode(email)).toStrictEqual(resendAccountConfirmationCodeReturnData);
            });
        });
    });
});