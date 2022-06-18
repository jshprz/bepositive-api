import Password from "../../../../modules/user-service/Password";
import AwsCognito from "../../../../infras/aws/AwsCognito";

jest.mock('../../../../modules/user-service/Password');
jest.mock('../../../../infras/aws/AwsCognito');

const passwordMock = Password as jest.MockedClass<typeof Password>;
const awsCognitoMock = AwsCognito as jest.MockedClass<typeof AwsCognito>;

describe('Facades :: PasswordFacade', () => {
   beforeEach(() => {
       // Clear all instances and calls to constructor and all methods:
       passwordMock.mockClear();
       awsCognitoMock.mockClear();
   });

   it('should call the instance of class PasswordFacade once', () => {
       const passwordInstance = new Password(new AwsCognito());
       expect(passwordMock).toHaveBeenCalledTimes(1);
   });

    it('should call the instance of dependency AwsCognito once', () => {
        const awsCognitoInstance = new AwsCognito();
        expect(awsCognitoMock).toHaveBeenCalledTimes(1);
    });

   describe(':: forgotPassword', () => {
       describe('#execute', () => {
           it('should call the forgotPassword() once with the expected arguments', () => {
               // To show that mockClear() is working:
               expect(passwordMock).not.toHaveBeenCalled();
               expect(awsCognitoMock).not.toHaveBeenCalled();

               const passwordInstance = new Password(new AwsCognito());
               expect(passwordMock).toHaveBeenCalledTimes(1);

               const email = 'test@test.com';

               passwordInstance.forgotPassword(email);

               // To make sure that we call the function with the expected arguments:
               expect(passwordMock.prototype.forgotPassword).toHaveBeenCalledWith(email);

               // To make sure we called the function once:
               expect(passwordMock.prototype.forgotPassword).toHaveBeenCalledTimes(1);
           });
           it('should return a string', () => {
               const passwordInstance = new Password(new AwsCognito());

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(passwordInstance, 'forgotPassword').mockImplementation(() => {
                   const result = 'test';

                   return result;
               });

               const email = 'test@test.com';
               const forgotPasswordReturnData = 'test';

               expect(typeof passwordInstance.forgotPassword(email)).toBe('string');
               expect(passwordInstance.forgotPassword(email)).toStrictEqual(forgotPasswordReturnData);
           });
       });
   });

   describe(':: resetPassword', () => {
       describe('#execute', () => {
           it('should call the resetPassword() once with the expected arguments', () => {
               // To show that mockClear() is working:
               expect(passwordMock).not.toHaveBeenCalled();
               expect(awsCognitoMock).not.toHaveBeenCalled();

               const passwordInstance = new Password(new AwsCognito());
               expect(passwordMock).toHaveBeenCalledTimes(1);

               const body = {
                   email: 'test@test.com',
                   verifyCode: 'test',
                   newPassword: 'test'
               };

               passwordInstance.resetPassword(body);

               // To make sure that we call the function with the expected arguments:
               expect(passwordMock.prototype.resetPassword).toHaveBeenCalledWith(body);

               // To make sure we called the function once:
               expect(passwordMock.prototype.resetPassword).toHaveBeenCalledTimes(1);
           });
           it('should return a string', () => {
                const passwordInstance = new Password(new AwsCognito());

               // Switch the function actual implementation with the mocked one
               // @ts-ignore
               jest.spyOn(passwordInstance, 'resetPassword').mockImplementation(() => {
                   const result = 'test';

                   return result;
               });

               const body = {
                   email: 'test@test.com',
                   verifyCode: 'test',
                   newPassword: 'test'
               };

               const resetPasswordReturnData = 'test';

               expect(typeof passwordInstance.resetPassword(body)).toBe('string');
               expect(passwordInstance.resetPassword(body)).toStrictEqual(resetPasswordReturnData);
           });
       });
   });
});