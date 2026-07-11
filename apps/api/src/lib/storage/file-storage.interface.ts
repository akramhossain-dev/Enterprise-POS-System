// ─────────────────────────────────────────────
// File Storage Service Interface
// ─────────────────────────────────────────────
// Abstraction layer designed to support multiple storage backends:
// Cloudinary, AWS S3, MinIO, or local disk.
// Implement a concrete adapter per backend and inject via DI or config.

export interface UploadResult {
  /** Public-accessible URL for the uploaded file */
  url: string;
  /** Storage key / path used to reference the file for deletion or URL generation */
  key: string;
}

export interface FileStorageService {
  /**
   * Upload a file buffer to the storage backend.
   * @param file - Raw file buffer
   * @param filename - Original filename (used for extension detection)
   * @param mimeType - MIME type of the file (e.g. 'image/jpeg')
   */
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;

  /**
   * Delete a file by its storage key.
   * @param key - The storage key returned from a previous upload
   */
  delete(key: string): Promise<void>;

  /**
   * Resolve a public URL from a storage key.
   * @param key - The storage key returned from a previous upload
   */
  getUrl(key: string): string;
}
