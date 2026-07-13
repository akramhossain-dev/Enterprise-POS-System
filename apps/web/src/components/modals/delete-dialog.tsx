'use client';

import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from './confirm-dialog';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onDelete: () => void | Promise<void>;
  loading?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemName,
  onDelete,
  loading = false,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemName ?? 'item'}?`}
      description={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : 'Are you sure you want to delete this item? This action cannot be undone.'
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onDelete}
      variant="destructive"
      loading={loading}
    />
  );
}
