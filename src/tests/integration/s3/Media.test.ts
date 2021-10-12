import Media from "../../../infra/s3/Media";
import { Container } from 'typedi';

describe('test getPresignedUrlUpload()', () => {
  it('should return presigned url/s', async () => {
    process.env.AWS_S3_BUCKET = 'bepositive-dev';
    const media = Container.get(Media);
    const files = [
      {
        key: 'joshua',
        type: 'image'
      },
      {
        key: 'perez',
        type: 'image'
      }
    ];
    const presignedUrls = await media.getPresignedUrlUpload(files);
    expect(media.getPresignedUrlUpload(files)).resolves.toHaveLength(2);
  });
});