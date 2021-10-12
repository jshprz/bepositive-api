export interface MediaInterface {
  getPresignedUrlUpload(files: {key: string, type: string}[]): Promise<string[]>;
}