'use client';

import * as React from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/format';
import { Spinner } from '@/components/ui/spinner';

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  accept?: Accept;
  maxSize?: number; // bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

interface PreviewFile {
  file: File;
  preview?: string;
  id: string;
}

export function FileUpload({
  onFilesAccepted,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = false,
  disabled = false,
  loading = false,
  label = 'Upload files',
  hint,
  error: externalError,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<PreviewFile[]>([]);
  const [dropError, setDropError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (
      acceptedFiles: File[],
      rejectedFiles: Parameters<
        NonNullable<React.ComponentProps<'input'>['onChange']>
      > extends never[]
        ? never
        : import('react-dropzone').FileRejection[],
    ) => {
      setDropError(null);

      if (rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0];
        const errorCode = firstRejection?.errors[0]?.code;
        if (errorCode === 'file-too-large') {
          setDropError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        } else if (errorCode === 'file-invalid-type') {
          setDropError('File type not supported.');
        } else if (errorCode === 'too-many-files') {
          setDropError(`Maximum ${maxFiles} file(s) allowed.`);
        } else {
          setDropError('Invalid file.');
        }
        return;
      }

      const previews = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).slice(2),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      if (multiple) {
        setFiles((prev) => [...prev, ...previews]);
        onFilesAccepted([...files.map((f) => f.file), ...acceptedFiles]);
      } else {
        setFiles(previews);
        onFilesAccepted(acceptedFiles);
      }
    },
    [files, maxFiles, maxSize, multiple, onFilesAccepted],
  );

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesAccepted(updated.map((f) => f.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: disabled || loading,
  });

  const errorMessage = externalError ?? dropError;

  return (
    <div className={cn('w-full space-y-3', className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10 scale-[1.02]',
          disabled && 'opacity-50 cursor-not-allowed',
          errorMessage && 'border-destructive/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        role="button"
        aria-label="Upload files"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <Spinner size="lg" className="text-primary" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload
                className={cn(
                  'w-6 h-6 transition-colors',
                  isDragActive ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-hidden="true"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
            </p>
            {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">
              Max size: {formatFileSize(maxSize)}
              {maxFiles > 1 && `, up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span role="alert">{errorMessage}</span>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Selected files">
          {files.map(({ file, id, preview }) => (
            <li
              key={id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={file.name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-backgroundestructive/10 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
