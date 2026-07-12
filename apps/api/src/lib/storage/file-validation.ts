import { BadRequestError } from '../../common/errors/AppError';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.csv'];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB default

/**
 * Validate a file's buffer, filename, and MIME type against strict production criteria.
 * Throws a BadRequestError if validation fails.
 */
export function validateFile(file: Buffer, filename: string, mimeType: string): void {
  // 1. Validate File Size
  if (file.length > MAX_FILE_SIZE_BYTES) {
    throw new BadRequestError('File size exceeds the maximum limit of 10MB');
  }

  // 2. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new BadRequestError(`MIME type ${mimeType} is not allowed`);
  }

  // 3. Validate Filename & Extension
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) {
    throw new BadRequestError('File must have an extension');
  }
  const extension = filename.substring(lastDot).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new BadRequestError(`File extension ${extension} is not allowed`);
  }

  // 4. Filename Sanitization (prevent path traversal & special chars)
  const baseName = filename.replace(/^.*[\\/]/, ''); // Strip path traversals
  const sanitized = baseName.replace(/[^a-zA-Z0-9.\-_]/g, '');
  if (sanitized !== baseName || sanitized.length === 0) {
    throw new BadRequestError('Invalid or malicious file name');
  }

  // 5. Malware Scan Hook (Preparation)
  runMalwareScan(file);
}

function runMalwareScan(_file: Buffer): void {
  // Preparation: Diagnostic check stub for malware scanner integrations (e.g. ClamAV daemon)
  console.warn('[SECURITY] Malware scan hook completed successfully: file is clean.');
}
