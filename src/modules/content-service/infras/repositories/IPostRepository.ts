import { UpdateResult } from "typeorm";

interface IPostRepository {
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string });
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<any>;
    getPostById(id: number): Promise<any>;
    update(id: number, caption: string): Promise<UpdateResult>;
    removePostById(id: number): Promise<UpdateResult>;
}

export default IPostRepository;