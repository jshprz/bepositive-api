import { Client } from '@googlemaps/google-maps-services-js';
import { Request, Response } from 'express';
import Logger from "../../config/Logger";

class LocationController {
    private _googleapis: Client;
    private _log;

    constructor() {
        this._googleapis = new Client({});
        this._log = Logger.createLogger('LocationController.ts');
    }

    async autocompleteSearch(req: Request, res: Response) {

        this._googleapis.placeAutocomplete({
            params: {
                input: req.params.searchQuery,
                key: `${process.env.GOOGLE_MAPS_API_KEY}`
            }
        }).then((result) => {
            const locationsResult = result.data.predictions.map((prediction) => {
                return {
                    description: prediction.description,
                    place_id: prediction.place_id,
                    structured_formatting: prediction.structured_formatting
                }
            });

            return res.status(200).json({
                message: 'Places successfully retrieved.',
                payload: locationsResult,
                status: 200
            });
        }).catch((error) => {
            this._log.error({
                message: error,
                payload: req.params
            });
            return res.status(500).json({
                message: error,
                error: 'Internal server error',
                status: 500
            });
        });
    }
}

export default LocationController;