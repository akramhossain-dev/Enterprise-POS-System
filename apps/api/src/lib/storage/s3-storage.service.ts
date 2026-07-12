import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { FileStorageService, UploadResult } from './file-storage.interface';

export class S3StorageService implements FileStorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: {
    region: string;
    endpoint?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string;
    forcePathStyle?: boolean;
  }) {
    const s3Config: Record<string, unknown> = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle ?? false,
    };

    if (config.endpoint !== undefined) {
      s3Config.endpoint = config.endpoint;
    }

    this.s3 = new S3Client(s3Config);
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const key = `uploads/${String(Date.now())}-${filename}`;
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read',
      },
    });

    await upload.done();
    return {
      key,
      url: this.getUrl(key),
    };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
