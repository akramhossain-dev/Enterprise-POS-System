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
  Layers,
  Tag,
  Ruler,
  Network,
  Briefcase,
  UserCheck,
  KeyRound,
  Warehouse,
  Store,
  LayoutGrid,
  Sliders,
  ArrowLeftRight,
  ClipboardCheck,
  AlertOctagon,
  FileText,
  Scale,
  Undo2,
  FileWarning,
  CreditCard,
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
        label: 'Inventory & Stock',
        href: '/inventory',
        icon: Package,
        permission: 'inventory:view',
        children: [
          {
            id: 'inventory-dashboard',
            label: 'Dashboard',
            href: '/inventory',
            icon: LayoutDashboard,
          },
          {
            id: 'stock-adjustments',
            label: 'Stock Adjustments',
            href: '/inventory/adjustments',
            icon: Sliders,
            permission: 'stock.view',
          },
          {
            id: 'stock-transfers',
            label: 'Stock Transfers',
            href: '/inventory/transfers',
            icon: ArrowLeftRight,
            permission: 'stock.view',
          },
          {
            id: 'cycle-count',
            label: 'Cycle Count',
            href: '/inventory/cycle-count',
            icon: ClipboardCheck,
            permission: 'inventory.stocktake',
          },
          {
            id: 'damage-loss',
            label: 'Damage & Loss',
            href: '/inventory/damage-loss',
            icon: AlertOctagon,
            permission: 'stock.view',
          },
        ],
      },
      {
        id: 'products',
        label: 'Products Catalog',
        href: '/products',
        icon: Tag,
        permission: 'inventory:view',
      },
      {
        id: 'categories',
        label: 'Categories',
        href: '/products/categories',
        icon: Layers,
        permission: 'category.read',
      },
      {
        id: 'brands',
        label: 'Brands',
        href: '/products/brands',
        icon: Tag,
        permission: 'brand.read',
      },
      {
        id: 'units',
        label: 'Units',
        href: '/products/units',
        icon: Ruler,
        permission: 'unit.read',
      },
      {
        id: 'purchase',
        label: 'Purchase',
        href: '/purchase',
        icon: Truck,
        permission: 'purchase:view',
        children: [
          {
            id: 'purchase-dashboard',
            label: 'Dashboard',
            href: '/purchase',
            icon: LayoutDashboard,
            permission: 'purchase:view',
          },
          {
            id: 'purchase-requisitions',
            label: 'Requisitions',
            href: '/purchase/requisitions',
            icon: FileText,
            permission: 'purchase:view',
          },
          {
            id: 'purchase-orders',
            label: 'Purchase Orders',
            href: '/purchase/orders',
            icon: Truck,
            permission: 'purchase:view',
          },
          {
            id: 'purchase-receive',
            label: 'Goods Receive (GRN)',
            href: '/purchase/receive',
            icon: Truck,
            permission: 'purchase.receive.view',
          },
          {
            id: 'purchase-invoices',
            label: 'Supplier Invoices',
            href: '/purchase/invoices',
            icon: FileText,
            permission: 'supplier.invoice.view',
          },
          {
            id: 'purchase-matching',
            label: 'Invoice Matching',
            href: '/purchase/matching',
            icon: Scale,
            permission: 'supplier.invoice.view',
          },
          {
            id: 'purchase-returns',
            label: 'Purchase Returns',
            href: '/purchase/returns',
            icon: Undo2,
            permission: 'purchase:view',
          },
          {
            id: 'purchase-credit-notes',
            label: 'Credit Notes',
            href: '/purchase/credit-notes',
            icon: FileWarning,
            permission: 'purchase:view',
          },
          {
            id: 'purchase-debit-notes',
            label: 'Debit Notes',
            href: '/purchase/debit-notes',
            icon: CreditCard,
            permission: 'purchase:view',
          },
        ],
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
        id: 'warehouses',
        label: 'Warehouses',
        href: '/warehouses',
        icon: Warehouse,
        permission: 'warehouse.view',
      },
      {
        id: 'branches',
        label: 'Branches',
        href: '/branches',
        icon: Store,
        permission: 'branch.read',
      },
      {
        id: 'storage-locations',
        label: 'Storage Locations',
        href: '/storage-locations',
        icon: LayoutGrid,
        permission: 'warehouse.view',
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
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'employees',
        label: 'Employees',
        href: '/employees',
        icon: UserCheck,
        permission: 'employee.read',
      },
      {
        id: 'users',
        label: 'User Accounts',
        href: '/users',
        icon: KeyRound,
        permission: 'user.read',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        href: '/roles',
        icon: Shield,
        permission: 'role.read',
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/departments',
        icon: Network,
        permission: 'employee.read',
      },
      {
        id: 'designations',
        label: 'Designations',
        href: '/designations',
        icon: Briefcase,
        permission: 'employee.read',
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
        id: 'settings',
        label: 'Settings',
        href: '/settings/profile',
        icon: Settings,
      },
    ],
  },
];
