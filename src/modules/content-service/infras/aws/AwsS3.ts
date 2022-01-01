import AWS from 'aws-sdk';

class AwsS3 {

    private readonly _s3;

    constructor() {
        this._s3 = new AWS.S3();
    }

    /**
     * Returns an array of string containing an upload presigned URL/s
     * @param s3FilenameKey: string
     * @param contentType: string
     * @param acl: string
     * @returns string
     */
    presignedPutUrl(s3FilenameKey: string, contentType: string, acl: string): string {

        type paramsType = {Bucket: string, Key: string, Expires: number, ContentType: string, ACL: string};
        const params: paramsType = {
            Bucket: `${process.env.AWS_S3_BUCKET}`,
            Key: s3FilenameKey,
            Expires: 300,
            ContentType: contentType,
            ACL: acl
        };

        return this._s3.getSignedUrl('putObject', params);
    }
}

export default AwsS3;