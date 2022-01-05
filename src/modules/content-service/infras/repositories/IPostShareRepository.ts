interface IPostShareRepository {
    create(item: { userId: string, postId: number, shareCaption: string });
    get(id: number): Promise<any>;
}

export default IPostShareRepository;