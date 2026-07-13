import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBag,
  Users,
  Truck,
  BookOpen,
  BarChart3,
  Settings,
  Building2,
  Shield,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
  permission?: string;
  roles?: string[];
  isExternal?: boolean;
  isSeparator?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'pos',
        label: 'Point of Sale',
        href: '/pos',
        icon: ShoppingCart,
        permission: 'pos:view',
      },
      {
        id: 'sales',
        label: 'Sales',
        href: '/sales',
        icon: ShoppingBag,
        permission: 'sales:view',
      },
      {
        id: 'inventory',
        label: 'Inventory',
        href: '/products',
        icon: Package,
        permission: 'inventory:view',
      },
      {
        id: 'purchase',
        label: 'Purchase',
        href: '/purchase',
        icon: Truck,
        permission: 'purchase:view',
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      {
        id: 'customers',
        label: 'Customers',
        href: '/customers',
        icon: Users,
        permission: 'customers:view',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        href: '/suppliers',
        icon: Building2,
        permission: 'suppliers:view',
      },
      {
        id: 'accounting',
        label: 'Accounting',
        href: '/accounting',
        icon: BookOpen,
        permission: 'accounting:view',
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: BarChart3,
        permission: 'reports:view',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/notifications',
        icon: Bell,
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        href: '/settings/roles',
        icon: Shield,
        permission: 'roles:view',
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings/profile',
        icon: Settings,
      },
    ],
  },
];
