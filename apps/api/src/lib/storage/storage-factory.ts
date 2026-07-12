import { FileStorageService, UploadResult } from './file-storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { validateFile } from './file-validation';

class ValidatingStorageService implements FileStorageService {
  constructor(private delegate: FileStorageService) {}

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    validateFile(file, filename, mimeType);
    return this.delegate.upload(file, filename, mimeType);
  }

  async delete(key: string): Promise<void> {
    return this.delegate.delete(key);
  }

  getUrl(key: string): string {
    return this.delegate.getUrl(key);
  }
}

export function createStorageService(): FileStorageService {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';
  let baseService: FileStorageService;

  if (provider === 's3' || provider === 'r2' || provider === 'minio') {
    const s3Options: Record<string, unknown> = {
      region: process.env.STORAGE_REGION ?? 'us-east-1',
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '',
      bucket: process.env.STORAGE_BUCKET ?? 'pos-assets',
      publicUrl: process.env.STORAGE_PUBLIC_URL ?? '',
      forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
    };

    if (process.env.STORAGE_ENDPOINT !== undefined) {
      s3Options.endpoint = process.env.STORAGE_ENDPOINT;
    }

    baseService = new S3StorageService(s3Options as never);
  } else {
    baseService = new LocalStorageService();
  }

  return new ValidatingStorageService(baseService);
}

export const storage = createStorageService();
export default storage;
