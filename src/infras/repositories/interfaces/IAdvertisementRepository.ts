
import { UpdateResult } from "typeorm";
import { Advertisements } from "../../../database/postgresql/models/Advertisements";
import { FlaggedPosts } from "../../../database/postgresql/models/FlaggedPosts";
import { advertisementType } from "../../../modules/advertisement-service/types";

interface IAdvertisementRepository {
    create(item: { userCognitoSub: string, name: string, link: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId:string, isSponsored: boolean }): Advertisements;
    getAllAdvertisements(): Promise<advertisementType[]>;
    getAdvertisementById(id: string): Promise<advertisementType>;
    update(id: string, caption: string): Promise<UpdateResult>;
    softDelete(id: string): Promise<boolean>;
    updateAdViewCount(id: string): Promise<UpdateResult>;
    flagAdvertisement(userId: string, advertisementId: string, reason: string): FlaggedPosts
    uploadAdvertisementAvatar(advertisementId: string, avatar: string): Promise<UpdateResult>;
}

export default IAdvertisementRepository;
