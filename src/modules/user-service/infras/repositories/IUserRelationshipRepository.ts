interface IUserRelationshipRepository {
    get(follower: boolean, userCognitoSub: string): Promise<any>;
}

export default IUserRelationshipRepository;