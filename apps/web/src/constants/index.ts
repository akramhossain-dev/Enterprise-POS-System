// App-wide constants

export const APP_NAME = 'Enterprise POS';
export const APP_VERSION = '1.0.0';
export const API_VERSION = 'v1';

// Date/time
export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy';
export const DEFAULT_DATETIME_FORMAT = 'MM/dd/yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// File upload
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Query keys
export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  USERS: {
    ALL: ['users'] as const,
    DETAIL: (id: string) => ['users', id] as const,
  },
  ROLES: {
    ALL: ['roles'] as const,
    DETAIL: (id: string) => ['roles', id] as const,
  },
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  COMMAND_PALETTE: 'mod+k',
  SEARCH: 'mod+f',
  NEW: 'mod+n',
  SAVE: 'mod+s',
  CLOSE: 'Escape',
} as const;

// Status colors mapping
export const STATUS_COLORS: Record<string, string> = {
  active: 'success',
  inactive: 'secondary',
  pending: 'warning',
  suspended: 'destructive',
};
