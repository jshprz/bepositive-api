import { UpdateResult } from "typeorm";
import { Posts } from "../../../../database/postgresql/models/Posts";

type getPostsByUserCognitoSubReturnType = Promise<{
    id: number,
    userId: string,
    caption: string,
    status: string,
    viewCount: number,
    googleMapsPlaceId: string,
    locationDetails: string,
    postMediaFiles: { key: string, type: string }[],
    createdAt: number,
    updatedAt: number,
    deletedAt: number
}[]>;

interface IPostRepository {
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Posts;
    getPostsByUserCognitoSub(userCognitoSub: string): getPostsByUserCognitoSubReturnType;
    getPostById(id: number): Promise<any>;
    update(id: number, caption: string): Promise<UpdateResult>;
    removePostById(id: number): Promise<UpdateResult>;
}

export default IPostRepository;