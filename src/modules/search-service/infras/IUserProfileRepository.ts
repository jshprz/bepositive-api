import type { searchUserType } from "../../types";

interface IUserProfileRepository {

    search(searchText: string): Promise<searchUserType[]>;
}

export default IUserProfileRepository;