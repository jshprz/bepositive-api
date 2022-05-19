import type { searchHashtagType } from "../../types";

interface IHashtagRepository {

    search(searchText: string): Promise<searchHashtagType[]>;
}

export default IHashtagRepository;