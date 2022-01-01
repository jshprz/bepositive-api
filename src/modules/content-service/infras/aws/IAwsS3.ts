interface IAwsS3 {
    presignedPutUrl(s3FilenameKey: string, contentType: string, acl: string): string;
}

export default IAwsS3;