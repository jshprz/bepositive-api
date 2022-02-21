import UserRelationshipRepository from '../../../../../../modules/user-service/infras/repositories/UserRelationshipRepository';
import {exec} from "child_process";
import {type} from "os";

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

    describe(':: create', () => {
        describe('#execute', () => {
           it('should call create() once with the expected arguments', () => {
               // To show that mockClear() is working:
               expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();

               const userRelationshipRepositoryInstance = new UserRelationshipRepository();
               expect(userRelationshipRepositoryMock).toHaveBeenCalledTimes(1);

               const followeeCognitoSub: string = 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b';
               const followerCognitoSub: string = 'a442d70f-53e1-4b6b-84a4-b76589d74772';

               userRelationshipRepositoryInstance.create(followeeCognitoSub, followerCognitoSub);

               expect(userRelationshipRepositoryMock.prototype.create).toHaveBeenCalledWith('ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b', 'a442d70f-53e1-4b6b-84a4-b76589d74772');
               expect(userRelationshipRepositoryMock.prototype.create).toHaveBeenCalledTimes(1);
           });

           it('should create a user relationship record', () => {
               // To show that mockClear() is working:
               expect(userRelationshipRepositoryMock).not.toHaveBeenCalled();

               const userRelationshipRepositoryInstance = new UserRelationshipRepository();

               const userRelationshipFakeEntity:any = [];

               jest.spyOn(userRelationshipRepositoryInstance, 'create').mockImplementation((followeeCognitoSub: string, followerCognitoSub: string) => {
                   const followeeId = followeeCognitoSub;
                   const followerId = followerCognitoSub;
                   const createdAt = Date.now();

                   userRelationshipFakeEntity.push({
                       followee_id: followeeId,
                       follower_id: followerId,
                       created_at: createdAt
                   });

                   return userRelationshipFakeEntity;
               });

               const followeeCognitoSub: string = 'ef0a9ab4-7e11-4518-98e8-ca9bf52c1a2b';
               const followerCognitoSub: string = 'a442d70f-53e1-4b6b-84a4-b76589d74772';

               expect(Array.isArray(userRelationshipRepositoryInstance.create(followeeCognitoSub, followerCognitoSub))).toBe(true);
               expect(userRelationshipFakeEntity.length).toStrictEqual(1);
               expect(typeof userRelationshipFakeEntity[0].followee_id).toBe('string');
               expect(typeof userRelationshipFakeEntity[0].follower_id).toBe('string');
               expect(typeof userRelationshipFakeEntity[0].created_at).toBe('number');
           });
        });
    });
});