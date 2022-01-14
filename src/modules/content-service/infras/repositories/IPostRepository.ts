import { UpdateResult } from "typeorm";
import { Posts } from "../../../../database/postgresql/models/Posts";

interface IPostRepository {
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Posts;
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<any>;
    getPostById(id: number): Promise<any>;
    update(id: number, caption: string): Promise<UpdateResult>;
    removePostById(id: number): Promise<UpdateResult>;
}

export default IPostRepository;