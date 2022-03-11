import { UpdateResult } from "typeorm";
import { Posts } from "../../../../database/postgresql/models/Posts";
import type { postType } from "../../../types";

interface IPostRepository {
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Posts;
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<postType[]>;
    getPostById(id: number): Promise<postType>;
    update(id: number, caption: string): Promise<UpdateResult>;
    softDelete(id: number): Promise<boolean>;
}

export default IPostRepository;