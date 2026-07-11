import { FileStorageService, UploadResult } from './file-storage.interface';

// ─────────────────────────────────────────────
// Local/Stub Storage Service
// ─────────────────────────────────────────────
// Development-only no-op stub. Replace with a concrete adapter
// (CloudinaryStorageService, S3StorageService, etc.) when ready.

export class LocalStorageService implements FileStorageService {
  upload(_file: Buffer, filename: string, _mimeType: string): Promise<UploadResult> {
    // TODO: Implement local disk storage or swap for a cloud adapter
    const key = `uploads/${String(Date.now())}-${filename}`;
    return Promise.resolve({
      key,
      url: `/static/${key}`,
    });
  }

  async delete(_key: string): Promise<void> {
    // TODO: Remove from disk or cloud
  }

  getUrl(key: string): string {
    return `/static/${key}`;
  }
}

/** Default singleton instance for use until DI is wired */
export const storageService: FileStorageService = new LocalStorageService();
