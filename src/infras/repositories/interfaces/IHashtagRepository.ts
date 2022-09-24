import { Hashtags } from "../../../database/postgresql/models/Hashtags";
import type { getHashtagType } from "../../../modules/content-service/types";
import { searchHashtagType } from "../../../modules/search-service/types";

interface IHashtagRepository {
    create(hashtagName: string): Hashtags;
    getBy(input: string, field: string): Promise<getHashtagType>;
    search(searchText: string): Promise<searchHashtagType[]>;
}

export default IHashtagRepository;