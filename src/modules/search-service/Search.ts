import IUserProfileRepository from "../../infras/repositories/interfaces/IUserProfileRepository";
import IHashtagRepository from "../../infras/repositories/interfaces/IHashtagRepository";

import Logger from "../../config/Logger";
import { QueryFailedError } from "typeorm";
import Error from "../../config/Error";
import { searchHashtagType, searchUserType } from "./types";

class Search {

    private _log;

    constructor(
        private _userProfileRepository: IUserProfileRepository,
        private _hashtagRepository: IHashtagRepository
    ) {
        this._log = Logger.createLogger('SearchFacade.ts');
    }

    /**
     * Search user(by @) or hashtag(by #) or combination of the two.
     * @param searchText: string
     * @returns Promise<{
     *         message: string,
     *         data: searchUserType[] | searchHashtagType[] | (searchUserType | searchHashtagType)[],
     *         code: number
     *     }>
     */
    searchUserOrHashtag(searchQuery: string): Promise<{
        message: string,
        data: searchUserType[] | searchHashtagType[] | (searchUserType | searchHashtagType)[],
        code: number
    }> {

        return new Promise(async (resolve, reject) => {

            const trimmedSearchQuery: string = searchQuery.trim();

            switch (trimmedSearchQuery[0]) {
                case '@':
                    const filteredUserSearch = trimmedSearchQuery.split('@').filter((item, index) => {
                        return index !== 0;
                    });
                    const searchUserText = filteredUserSearch.join();

                    const searchUserResult = await this._userProfileRepository.search(searchUserText).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'searchUserOrHashtag',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: searchQuery
                        });

                        return reject({
                            error: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });

                    if (searchUserResult) {
                        return resolve({
                            message: 'User search result.',
                            data: searchUserResult,
                            code: 200
                        });
                    }
                case '#':
                    const filteredHashtagSearch = trimmedSearchQuery.split('#').filter((item, index) => {
                        return index !== 0;
                    });
                    const searchHashtagText = filteredHashtagSearch.join();

                    const searchHashtagResult = await this._hashtagRepository.search(searchHashtagText).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'searchUserOrHashtag',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: searchQuery
                        });

                        return reject({
                            error: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });

                    if (searchHashtagResult) {
                        return resolve({
                            message: 'Hashtag search result.',
                            data: searchHashtagResult,
                            code: 200
                        });
                    }
                default:
                    const searchUserResult2 = await this._userProfileRepository.search(trimmedSearchQuery).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'searchUserOrHashtag',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: searchQuery
                        });

                        return reject({
                            error: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });

                    const searchHashtagResult2 = await this._hashtagRepository.search(trimmedSearchQuery).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'searchUserOrHashtag',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: searchQuery
                        });

                        return reject({
                            error: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });

                    if (searchUserResult2 && searchHashtagResult2) {
                        return resolve({
                            message: 'User and Hashtag search result.',
                            data: [
                                ...searchUserResult2,
                                ...searchHashtagResult2
                            ],
                            code: 200
                        });
                    } else {
                        return reject({
                            message: `Something went wrong in search result: ${searchUserResult2} - ${searchHashtagResult2} `,
                            code: 500
                        });
                    }
            }

        });
    }
}

export default Search;