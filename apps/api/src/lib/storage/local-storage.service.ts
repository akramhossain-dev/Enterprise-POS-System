import fs from 'fs';
import path from 'path';
import { FileStorageService, UploadResult } from './file-storage.interface';

export class LocalStorageService implements FileStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir = 'uploads', baseUrl = '/static/uploads') {
    this.uploadDir = path.resolve(process.cwd(), uploadDir);
    this.baseUrl = baseUrl;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string, _mimeType: string): Promise<UploadResult> {
    const safeFilename = `${String(Date.now())}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(this.uploadDir, safeFilename);

    await fs.promises.writeFile(filePath, file);

    return {
      key: safeFilename,
      url: this.getUrl(safeFilename),
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

export const storageService: FileStorageService = new LocalStorageService();
