import AccessTokenRepository from '../../../../../../modules/user-service/infras/repositories/AccessTokenRepository';

jest.mock('../../../../../../modules/user-service/infras/repositories/AccessTokenRepository');

const accessTokenRepositoryMock = AccessTokenRepository as jest.MockedClass<typeof AccessTokenRepository>;

describe('Repositories :: AccessTokenRepository', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        accessTokenRepositoryMock.mockClear();
    });

    it('should call the instance of class AccessTokenRepository and accessTokens once', () => {
        const accessTokenRepositoryInstance = new AccessTokenRepository();

        expect(accessTokenRepositoryMock).toHaveBeenCalledTimes(1);
    });

    describe(':: create', () => {
        describe('#execute', () => {
            it('should call the create() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const accessTokenRepositoryInstance = new AccessTokenRepository();

                expect(accessTokenRepositoryMock).toHaveBeenCalledTimes(1);

                const item = {accessToken: 'testaccesstoken', userCognitoSub: 'testusercognito'};

                accessTokenRepositoryInstance.create(item);

                expect(accessTokenRepositoryMock.prototype.create).toHaveBeenCalledWith({accessToken: 'testaccesstoken', userCognitoSub: 'testusercognito'});
                expect(accessTokenRepositoryMock.prototype.create).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe(':: delete', () => {
        describe('#execute', () => {
            it('should call the delete() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(accessTokenRepositoryMock).not.toHaveBeenCalled();

                const accessTokenRepositoryInstance = new AccessTokenRepository();

                expect(accessTokenRepositoryMock).toHaveBeenCalledTimes(1);

                const userCognitoSub = 'testusercognito';

                accessTokenRepositoryInstance.delete(userCognitoSub);

                expect(accessTokenRepositoryMock.prototype.delete).toHaveBeenCalledWith('testusercognito');
                expect(accessTokenRepositoryMock.prototype.delete).toHaveBeenCalledTimes(1);
            });
        });
    });
});



