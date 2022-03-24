import { UpdateResult } from "typeorm";
import { UserPrivacy } from "../../../../database/postgresql/models/UserPrivacy";

interface IUserPrivacyRepository {
    create(userCognitoSub: string): UserPrivacy;
    getPrivacyStatus(userCognitoSub: string): Promise<any>;
    updatePrivacy(userCognitoSub: string, status: string): Promise<UpdateResult>;
}

export default IUserPrivacyRepository;