import { ManagedUpload } from "aws-sdk/clients/s3";

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

interface IAwsS3 {
    upload(params: s3UploadParamsType): ManagedUpload;
    headObject(params: s3HeadObjectParamsType): any;
    presignedPutUrl(s3FilenameKey: string, contentType: string, acl: string): Promise<string>;
}

export default IAwsS3;