import AwsCognito from '../../../../../../infras/aws/AwsCognito';
import AWS from 'aws-sdk';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

jest.mock('../../../../../../infras/aws/AwsCognito');
jest.mock('aws-sdk');
jest.mock('amazon-cognito-identity-js');

const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;
const cognitoIdentityServiceProviderMock = AWS.CognitoIdentityServiceProvider as jest.MockedClass<typeof AWS.CognitoIdentityServiceProvider>;
const cognitoUserPoolMock = CognitoUserPool as jest.MockedClass<typeof CognitoUserPool>;
const cognitoUserAttributeMock = CognitoUserAttribute as jest.MockedClass<typeof CognitoUserAttribute>;
const cognitoUserMock = CognitoUser as jest.MockedClass<typeof CognitoUser>;
const authenticationDetailsMock = AuthenticationDetails as jest.MockedClass<typeof AuthenticationDetails>;

describe('Infras :: AwsCognito', () => {
   beforeEach(() => {
       // Clear all instances and calls to constructor and all methods:
       awsCognitoMock.mockClear();
       cognitoIdentityServiceProviderMock.mockClear();
       cognitoUserPoolMock.mockClear();
       cognitoUserAttributeMock.mockClear();
       cognitoUserMock.mockClear();
       authenticationDetailsMock.mockClear();
   });

   it('should call the instance of class AwsCognito once', () => {
       const awsCognitoInstance = new AwsCognito();
       expect(awsCognitoMock).toHaveBeenCalledTimes(1);
   });

   describe(':: userPool', () => {
       describe('#execute', () => {
           it('should call userPool() once', () => {
               // To show that mockClear() is working:
               expect(awsCognitoMock).not.toHaveBeenCalled();
               expect(cognitoIdentityServiceProviderMock).not.toHaveBeenCalled();
               expect(cognitoUserPoolMock).not.toHaveBeenCalled();
               expect(cognitoUserAttributeMock).not.toHaveBeenCalled();
               expect(cognitoUserMock).not.toHaveBeenCalled();
               expect(authenticationDetailsMock).not.toHaveBeenCalled();

               const awsCognitoInstance = new AwsCognito();
               expect(awsCognitoMock).toHaveBeenCalledTimes(1);

               awsCognitoInstance.userPool();

               expect(awsCognitoMock.prototype.userPool).toHaveBeenCalledTimes(1);
           });

           it('should return instance of CognitoUserPool', () => {
               const awsCognitoInstance = new AwsCognito();

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(awsCognitoInstance, 'userPool').mockImplementation(() => {
                   const poolData = {
                       UserPoolId: 'test user pool id',
                       ClientId: 'test client id'
                   };

                   return new CognitoUserPool(poolData);
               });

               expect(awsCognitoInstance.userPool()).toBeInstanceOf(CognitoUserPool);
           });
       });
   });

   describe(':: cognitoUserAttributeList', () => {
       describe('#execute', () => {
           it('should call the cognitoUserAttributeList() once with the expected arguments', () => {
               const awsCognitoInstance = new AwsCognito();
               expect(awsCognitoMock).toHaveBeenCalledTimes(1);

               const email: string = 'test@test.com';
               const phoneNumber = '+639258283823';
               const name: string = 'Loki';

               awsCognitoInstance.cognitoUserAttributeList(email, phoneNumber, name);

               expect(awsCognitoMock.prototype.cognitoUserAttributeList).toHaveBeenCalledWith('test@test.com', '+639258283823', 'Loki');
               expect(awsCognitoMock.prototype.cognitoUserAttributeList).toHaveBeenCalledTimes(1);
           });

           it('should return array of CognitoUserAttribute instances', () => {
               const awsCognitoInstance = new AwsCognito();

               const email: string = 'test@test.com';
               const phoneNumber = '+639258283823';
               const name: string = 'Loki';

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(awsCognitoInstance, 'cognitoUserAttributeList').mockImplementation(() => {
                   const attribute = (key: string, value: string) => {
                       return {
                           Name: key,
                           Value: value
                       }
                   }

                   return [
                       new CognitoUserAttribute(attribute('email', email)),
                       new CognitoUserAttribute(attribute('phoneNumber', phoneNumber)),
                       new CognitoUserAttribute(attribute('name', name))
                   ];
               });

               expect(Array.isArray(awsCognitoInstance.cognitoUserAttributeList(email, phoneNumber, name))).toBe(true);
               expect(awsCognitoInstance.cognitoUserAttributeList(email, phoneNumber, name).length).toStrictEqual(3)
               expect(awsCognitoInstance.cognitoUserAttributeList(email, phoneNumber, name)[0]).toBeInstanceOf(CognitoUserAttribute);
               expect(awsCognitoInstance.cognitoUserAttributeList(email, phoneNumber, name)[1]).toBeInstanceOf(CognitoUserAttribute);
           });
       });
   });

    describe(':: getCognitoUser', () => {
        describe('#execute', () => {
            it('should call the getCognitoUser() once with the expected arguments', () => {
                const awsCognitoInstance = new AwsCognito();
                expect(awsCognitoMock).toHaveBeenCalledTimes(1);

                const email: string = 'test@test.com';

                awsCognitoInstance.getCognitoUser(email);

                expect(awsCognitoMock.prototype.getCognitoUser).toHaveBeenCalledWith('test@test.com');
                expect(awsCognitoMock.prototype.getCognitoUser).toHaveBeenCalledTimes(1);
            });

            it('should return instance of CognitoUser', () => {
                const awsCognitoInstance = new AwsCognito();

                const email: string = 'test@test.com';

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(awsCognitoInstance, 'getCognitoUser').mockImplementation(() => {
                    const userData = {
                        Username: 'test@test.com',
                        Pool: awsCognitoInstance.userPool()
                    };

                    return new CognitoUser(userData);
                });

                expect(awsCognitoInstance.getCognitoUser(email)).toBeInstanceOf(CognitoUser);
            });
        });
    });

    describe(':: getAuthenticationDetails', () => {
        describe('#execute', () => {
            it('should call the getAuthenticationDetails() once with the expected arguments', () => {
                const awsCognitoInstance = new AwsCognito();
                expect(awsCognitoMock).toHaveBeenCalledTimes(1);

                const body = {email: 'test@test.com', password: 'mypassword'};

                awsCognitoInstance.getAuthenticationDetails(body);

                expect(awsCognitoMock.prototype.getAuthenticationDetails).toHaveBeenCalledWith({email: 'test@test.com', password: 'mypassword'});
                expect(awsCognitoMock.prototype.getAuthenticationDetails).toHaveBeenCalledTimes(1);
            });

            it('should return instance of CognitoUser', () => {
                const awsCognitoInstance = new AwsCognito();

                // Switch the function actual implementation with the mocked one
                // @ts-ignore
                jest.spyOn(awsCognitoInstance, 'getAuthenticationDetails').mockImplementation(() => {
                    const authenticationData = { Username: 'test@test.com', Password: 'mypassword' };

                    return new AuthenticationDetails(authenticationData);
                });

                const body = { email: 'test@test.com', password: 'mypassword' };

                expect(awsCognitoInstance.getAuthenticationDetails(body)).toBeInstanceOf(AuthenticationDetails);
            });
        });
    });
});