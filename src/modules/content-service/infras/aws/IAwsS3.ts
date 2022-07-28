type s3HeadObjectParamsType = {
    Bucket: string,
    Key: string
}

interface IAwsS3 {
    presignedPutUrl(s3FilenameKey: string, contentType: string, acl: string): Promise<string>;
    headObject(params: s3HeadObjectParamsType): any;
}

export default IAwsS3;