import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { Client } from '@googlemaps/google-maps-services-js';
import { Request, Response } from 'express';
import path from "path";
import Logger from '../../infra/utils/Logger';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class Places {
  private _googleapis: Client;
  private _log: Logger;

  constructor() {
    this._googleapis = new Client({});
    this._log = Container.get(Logger);
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
        label: `${filePath} - autocompleteSearch(req, res)`,
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

export default Places;