import AWS from 'aws-sdk';
import { ManagedUpload } from "aws-sdk/clients/s3";
import IAwsS3 from "./IAwsS3";

type s3UploadParamsType = {
    Bucket: string,
    Key: string,
    ContentType: string,
    Body: Buffer,
    ACL: string
};

type s3HeadObjectParamsType = {
    Bucket: string,
    Key: string
}

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

    /**
     * A function to check if the object exists in the provided AWS S3 Bucket
     */
    headObject(params: s3HeadObjectParamsType): any {
        return this._s3.headObject(params);
    }

    /**
     * Returns an array of string containing an upload presigned URL/s
     * @param s3FilenameKey: string
     * @param contentType: string
     * @param acl: string
     * @returns string
     */
    presignedPutUrl(s3FilenameKey: string, contentType: string, acl: string): Promise<string> {

        type paramsType = {Bucket: string, Key: string, Expires: number, ContentType: string, ACL: string};

        const params: paramsType = {
            Bucket: `${process.env.AWS_S3_BUCKET}`,
            Key: s3FilenameKey,
            Expires: 300,
            ContentType: contentType,
            ACL: acl
        };

        return this._s3.getSignedUrlPromise('putObject', params);
    }
}

export default AwsS3;