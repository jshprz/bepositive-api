import 'reflect-metadata';
import { Service } from 'typedi';
import AwsS3 from './AwsS3';
import path from 'path';
import { MediaInterface } from '../../interface/s3/MediaInterface';
import { errors } from '../../config/index';

const filePath = path.dirname(__filename) + '\\' + path.basename(__filename);

@Service()
class Media extends AwsS3 implements MediaInterface {

  constructor() {
    super();
  }

  /**
   * Getting an upload presigned URL via AWS SDK
   * @param files: {key: string, type: string}[]
   * @returns Promise<string[]>
   */
  getPresignedUrlUpload(files: {key: string, type: string}[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      try {
        const promises: string[] = [];
        files.forEach((file: {key: string, type: string}) => {
          promises.push(this.presignedPutUrl(file.key, file.type, 'public-read'));
        });

        Promise.all(promises).then((result: string[]) => {
          resolve(result);
        });
      } catch (error: any) {
        this._log.error({
          label: `${filePath} - getPresignedUrlUpload()`,
          message: `${error}`,
          payload: files
        });
        reject(errors.AWS_S3_ERROR);
      }
    });
  }
}

export default Media;