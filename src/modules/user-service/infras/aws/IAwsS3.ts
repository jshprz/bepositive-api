import type { s3UploadParamsType } from "../../../types";
import { ManagedUpload } from "aws-sdk/clients/s3";

interface IAwsS3 {
    upload(params: s3UploadParamsType): ManagedUpload;
}

export default IAwsS3;