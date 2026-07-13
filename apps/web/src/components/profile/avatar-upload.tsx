'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUploadAvatar, useDeleteAvatar } from '@/hooks/use-profile';
import { normalizeError } from '@/utils/error';
import { cn } from '@/utils/cn';
import type { User } from '@/types/auth';

interface AvatarUploadProps {
  user: User;
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: deleting } = useDeleteAvatar();
  const [preview, setPreview] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setDropError(null);
      const file = accepted[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setDropError('Image must be under 5MB');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      uploadAvatar(file, {
        onError: (err) => {
          setDropError(normalizeError(err).message);
          setPreview(null);
        },
      });
    },
    [uploadAvatar],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (rejections) => {
      setDropError(rejections[0]?.errors[0]?.message ?? 'Invalid file');
    },
  });

  const currentAvatar = preview ?? user.avatar ?? undefined;

  return (
    <div className="space-y-6">
      {/* Current avatar preview */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative">
          <Avatar
            src={currentAvatar}
            alt={user.fullName}
            fallback={`${user.firstName[0]}${user.lastName[0]}`}
            size="xl"
            className="ring-4 ring-border shadow-md"
          />
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <p className="text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · Max 5MB</p>
          {user.avatar && (
            <Button
              variant="outline"
              size="sm"
              loading={deleting}
              onClick={() => {
                setPreview(null);
                deleteAvatar();
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
            >
              Remove photo
            </Button>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-[--radius-lg] border-2 border-dashed p-8 text-center',
          'transition-all duration-200 cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <input {...getInputProps()} aria-label="Upload avatar image" />

        <AnimatePresence>
          <motion.div
            key={isDragActive ? 'drag' : 'idle'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {isDragActive ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Recommended: 400×400px or larger</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {dropError && (
        <p role="alert" className="text-xs text-destructive">
          {dropError}
        </p>
      )}
    </div>
  );
}
