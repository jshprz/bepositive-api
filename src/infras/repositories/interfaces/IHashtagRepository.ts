import { Hashtags } from "../../../database/postgresql/models/Hashtags";
import type { getHashtagType } from "../../../modules/content-service/types";

interface IHashtagRepository {
    create(hashtagName: string): Hashtags;
    getBy(input: string, field: string): Promise<getHashtagType>;
}

export default IHashtagRepository;