import { ManagedUpload } from "aws-sdk/clients/s3";

type s3UploadParamsType = {
    Bucket: string,
    Key: string,
    ContentType: string,
    Body: Buffer,
    ACL: string
};

interface IAwsS3 {
    upload(params: s3UploadParamsType): ManagedUpload;
}

export default IAwsS3;