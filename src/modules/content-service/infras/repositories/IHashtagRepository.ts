import { Hashtags } from "../../../../database/postgresql/models/Hashtags";
import type { getHashtagType } from "../../../types";

interface IHashtagRepository {
    create(hashtagName: string): Hashtags;
    get(hashtagName: string): Promise<getHashtagType>;
}

export default IHashtagRepository;