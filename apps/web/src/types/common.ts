// ============================================================
// COMMON / SHARED TYPES
// ============================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type ValueOf<T> = T[keyof T];

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type WithId<T> = T & { id: string };

export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithSoftDelete<T> = T & {
  deletedAt: string | null;
};

// Size variants used across components
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color/status variants
export type StatusVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline'
  | 'ghost';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Status types
export type ActiveStatus = 'active' | 'inactive';

// Generic select option
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// File types
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Address
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Modal state
export interface ModalState {
  isOpen: boolean;
  title?: string;
  description?: string;
}
