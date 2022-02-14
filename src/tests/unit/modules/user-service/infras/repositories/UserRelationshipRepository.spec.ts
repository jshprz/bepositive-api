import UserRelationshipRepository from '../../../../../../modules/user-service/infras/repositories/UserRelationshipRepository';

jest.mock('../../../../../../modules/user-service/infras/repositories/UserRelationshipRepository');

const userRelationshipRepositoryMock = UserRelationshipRepository as jest.MockedClass<typeof UserRelationshipRepository>;

describe('Repositories :: UserRelationshipRepository', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        userRelationshipRepositoryMock.mockClear();
    });

    it('should call the instance of class UserRelationshipRepository and accessTokens once', () => {
        const userRelationshipRepositoryInstance = new userRelationshipRepositoryMock();

        expect(userRelationshipRepositoryMock).toHaveBeenCalledTimes(1);
    });

    describe(':: get', () => {
        describe('#execute', () => {
            it('should call the get() once with the expected arguments', () => {
                // To show that mockClear() is working:
                expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();

                const userRelationshipRepositoryInstance = new UserRelationshipRepository();

                expect(userRelationshipRepositoryMock).toHaveBeenCalledTimes(1);

                const follower = true;
                const userCognitoSub = 'testusercognito'

                userRelationshipRepositoryInstance.get(follower, userCognitoSub);

                expect(userRelationshipRepositoryMock.prototype.get).toHaveBeenCalledWith(true, 'testusercognito');
                expect(userRelationshipRepositoryMock.prototype.get).toHaveBeenCalledTimes(1);
            });
        });
    });
});