export type NotificationType =
  'info' | 'success' | 'warning' | 'error' | 'sale' | 'stock' | 'payment' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  isRead: boolean;
  createdAt: string; // ISO string
}
