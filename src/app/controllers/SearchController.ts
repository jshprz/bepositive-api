// Infras
import UserProfileRepository from '../../modules/search-service/infras/UserProfileRepository';
import HashtagRepository from "../../modules/search-service/infras/HashtagRepository";

// Facades
import SearchFacade from "../../modules/search-service/facades/SearchFacade";

import { Request, Response } from 'express';
import { validationResult } from "express-validator";

class SearchController {

    private _searchFacade;

    constructor() {
        this._searchFacade = new SearchFacade(
            new UserProfileRepository(),
            new HashtagRepository()
        );
    }

    async searchUserOrHashtag(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.searchQuery) {
            return res.status(400).json({
                message: errors.searchQuery.msg,
                error: 'Bad request error',
                status: 400
            });
        }

        try {

            const searchQuery: string = req.body.searchQuery;

            const searchUserOrHashtagResult = await this._searchFacade.searchUserOrHashtag(searchQuery);

            return res.status(200).json({
                message: searchUserOrHashtagResult.message,
                payload: searchUserOrHashtagResult.data,
                status: searchUserOrHashtagResult.code
            });
        } catch (error: any) {

            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }
}

export default SearchController;