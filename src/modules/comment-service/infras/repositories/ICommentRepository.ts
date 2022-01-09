interface ICommentRepository {
    create(item: {userCognitoSub: string, postId: number, content: string});
}

export default ICommentRepository;