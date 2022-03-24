import AWS from 'aws-sdk';
import type { s3UploadParamsType } from "../../../types";
import { ManagedUpload } from "aws-sdk/clients/s3";
import IAwsS3 from "./IAwsS3";

class AwsS3 implements IAwsS3 {
    private readonly _s3;

    constructor() {
        this._s3 = new AWS.S3();
    }

    /**
     * A function to upload to AWS S3.
     * @param params: s3UploadParamsType
     * @returns ManagedUpload
     */
    upload(params: s3UploadParamsType): ManagedUpload {
        return this._s3.upload(params);
    }
}

export default AwsS3;