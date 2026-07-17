'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ImageFile {
  id: string;
  url: string;
  name: string;
  size?: number;
  progress: number; // 0 to 100
  isPrimary: boolean;
  file?: File;
}

interface ImageManagerProps {
  value: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

export function ImageManager({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMb = 5,
}: ImageManagerProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum of ${maxFiles} images allowed`);
        return;
      }

      const valueRef = { current: value };

      const newImages: ImageFile[] = acceptedFiles.map((file) => {
        const id = Math.random().toString(36).substring(2, 9);
        const url = URL.createObjectURL(file);

        // Simulate upload progress
        const img: ImageFile = {
          id,
          url,
          name: file.name,
          size: file.size,
          progress: 0,
          isPrimary: value.length === 0,
          file,
        };

        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 10;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
          }
          onChange(
            valueRef.current.map((item) =>
              item.id === id ? { ...item, progress: currentProgress } : item,
            ),
          );
        }, 150);

        return img;
      });

      const updatedList = [...value, ...newImages];
      valueRef.current = updatedList;
      onChange(updatedList);
    },
    [value, maxFiles, onChange],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: maxSizeMb * 1024 * 1024,
  });

  const removeImage = (id: string) => {
    const target = value.find((img) => img.id === id);
    if (target?.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url);
    }
    const filtered = value.filter((img) => img.id !== id);

    // Re-assign primary if removed primary
    if (target?.isPrimary && filtered.length > 0) {
      filtered[0]!.isPrimary = true;
    }

    onChange(filtered);
  };

  const setPrimary = (id: string) => {
    onChange(
      value.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      })),
    );
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-border bg-cardard hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PNG, JPEG, WebP up to {maxSizeMb}MB. Max {maxFiles} images.
          </p>
        </div>
      </div>

      {/* Gallery Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {value.map((img) => (
            <div
              key={img.id}
              className={cn(
                'group relative aspect-square rounded-lg border overflow-hidden bg-muted transition-all duration-200',
                img.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-border',
              )}
            >
              {/* Image */}
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Progress Overlay */}
              {img.progress < 100 && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-2">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden max-w-[80px]">
                    <div
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-1 tabular-nums">
                    {img.progress}%
                  </span>
                </div>
              )}

              {/* Primary Badge */}
              {img.isPrimary && img.progress === 100 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  Primary
                </span>
              )}

              {/* Action buttons (Visible on hover or mobile always) */}
              {img.progress === 100 && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {!img.isPrimary && (
                    <Button
                      size="icon-xs"
                      variant="secondary"
                      onClick={() => setPrimary(img.id)}
                      title="Set as primary"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="icon-xs"
                    variant="destructive"
                    onClick={() => removeImage(img.id)}
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
