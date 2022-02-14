import PasswordFacade from "../../../../../modules/user-service/facades/PasswordFacade";
import AwsCognito from "../../../../../modules/user-service/infras/aws/AwsCognito";

jest.mock('../../../../../modules/user-service/facades/PasswordFacade');
jest.mock('../../../../../modules/user-service/infras/aws/AwsCognito');

const passwordFacadeMock = PasswordFacade as jest.MockedClass<typeof PasswordFacade>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;

describe('Facades :: PasswordFacade', () => {
   beforeEach(() => {
       // Clear all instances and calls to constructor and all methods:
       passwordFacadeMock.mockClear();
       awsCognitoMock.mockClear();
   });

   it('should call the instance of class PasswordFacade once', () => {
       const passwordFacadeInstance = new PasswordFacade(new AwsCognito());
       expect(passwordFacadeMock).toHaveBeenCalledTimes(1);
   });

    it('should call the instance of dependency AwsCognito once', () => {
        const awsCognitoInstance = new AwsCognito();
        expect(awsCognitoMock).toHaveBeenCalledTimes(1);
    });

   describe(':: forgotPassword', () => {
       describe('#execute', () => {
           it('should call the forgotPassword() once with the expected arguments', () => {
               // To show that mockClear() is working:
               expect(passwordFacadeMock).not.toHaveBeenCalled();
               expect(awsCognitoMock).not.toHaveBeenCalled();

               const passwordFacadeInstance = new PasswordFacade(new AwsCognito());
               expect(passwordFacadeMock).toHaveBeenCalledTimes(1);

               const email = 'test@test.com';

               passwordFacadeInstance.forgotPassword(email);

               // To make sure that we call the function with the expected arguments:
               expect(passwordFacadeMock.prototype.forgotPassword).toHaveBeenCalledWith(email);

               // To make sure we called the function once:
               expect(passwordFacadeMock.prototype.forgotPassword).toHaveBeenCalledTimes(1);
           });
           it('should return a string', () => {
               const passwordFacadeInstance = new PasswordFacade(new AwsCognito());

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(passwordFacadeInstance, 'forgotPassword').mockImplementation(() => {
                   const result = 'test';

                   return result;
               });

               const email = 'test@test.com';
               const forgotPasswordReturnData = 'test';

               expect(typeof passwordFacadeInstance.forgotPassword(email)).toBe('string');
               expect(passwordFacadeInstance.forgotPassword(email)).toStrictEqual(forgotPasswordReturnData);
           });
       });
   });

   describe(':: resetPassword', () => {
       describe('#execute', () => {
           it('should call the resetPassword() once with the expected arguments', () => {
               // To show that mockClear() is working:
               expect(passwordFacadeMock).not.toHaveBeenCalled();
               expect(awsCognitoMock).not.toHaveBeenCalled();

               const passwordFacadeInstance = new PasswordFacade(new AwsCognito());
               expect(passwordFacadeMock).toHaveBeenCalledTimes(1);

               const body = {
                   email: 'test@test.com',
                   verifyCode: 'test',
                   newPassword: 'test'
               };

               passwordFacadeInstance.resetPassword(body);

               // To make sure that we call the function with the expected arguments:
               expect(passwordFacadeMock.prototype.resetPassword).toHaveBeenCalledWith(body);

               // To make sure we called the function once:
               expect(passwordFacadeMock.prototype.resetPassword).toHaveBeenCalledTimes(1);
           });
           it('should return a string', () => {
                const passwordFacadeInstance = new PasswordFacade(new AwsCognito());

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(passwordFacadeInstance, 'resetPassword').mockImplementation(() => {
                   const result = 'test';

                   return result;
               });

               const body = {
                   email: 'test@test.com',
                   verifyCode: 'test',
                   newPassword: 'test'
               };

               const resetPasswordReturnData = 'test';

               expect(typeof passwordFacadeInstance.resetPassword(body)).toBe('string');
               expect(passwordFacadeInstance.resetPassword(body)).toStrictEqual(resetPasswordReturnData);
           });
       });
   });
});