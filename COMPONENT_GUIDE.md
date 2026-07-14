# Enterprise POS Component Guide

This guide documents the reusable components introduced during product management implementation.

---

## 1. Catalog Components

### ImageManager

`src/components/product/image-manager.tsx`

The `ImageManager` handles multiple image selection, drag-and-drop actions, file type/size validation, real-time upload progress, and selection of a primary thumbnail image.

#### Props

```typescript
interface ImageManagerProps {
  value: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxFiles?: number; // Default: 5
  maxSizeMb?: number; // Default: 5
}
```

#### Example Usage

```tsx
import { ImageManager, type ImageFile } from '@/components/product/image-manager';

const [images, setImages] = useState<ImageFile[]>([]);

<ImageManager value={images} onChange={setImages} maxFiles={5} maxSizeMb={5} />;
```

---

### BarcodeWidget

`src/components/product/barcode-widget.tsx`

The `BarcodeWidget` renders an SVG barcode label with formatting information and name/price metadata, and integrates a printable layout page overlay.

#### Props

```typescript
interface BarcodeWidgetProps {
  barcode?: string;
  name?: string;
  price?: number;
  onGenerate?: () => void;
}
```

#### Example Usage

```tsx
import { BarcodeWidget } from '@/components/product/barcode-widget';

<BarcodeWidget barcode="EP100028" name="Premium Wireless Keyboard" price={59.99} />;
```

---

### ProductForm

`src/components/product/product-form.tsx`

The unified React Hook Form for Product creation and editing. Combines general text inputs, select dropdowns for classifications (Categories, Brands, Units, Taxes), drag-and-drop `ImageManager` and live `BarcodeWidget` preview.

#### Props

```typescript
interface ProductFormProps {
  initialValues?: Product;
  onSubmit: (values: ProductFormValues) => void;
  isPending: boolean;
}
```

---

## 2. Catalog Management Components

### CategoryForm

`src/components/catalog/category-form.tsx`

The `CategoryForm` manages category data. It features real-time slug auto-generation from name input with manual overrides, parent category selection dropdowns, priority order inputs, custom asset icons/banner images, and a collapsible SEO details section.

#### Props

```typescript
interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (values: CategoryFormValues) => void;
  isPending: boolean;
}
```

#### Example Usage

```tsx
import { CategoryForm } from '@/components/catalog/category-form';

<CategoryForm onSubmit={handleSave} isPending={isSaving} />;
```

---

### BrandForm

`src/components/catalog/brand-form.tsx`

The `BrandForm` manages brand details including name, logo URL, official website validation, country selectors, descriptions, and statuses.

#### Props

```typescript
interface BrandFormProps {
  initialValues?: Brand;
  onSubmit: (values: BrandFormValues) => void;
  isPending: boolean;
}
```

---

### UnitForm

`src/components/catalog/unit-form.tsx`

The `UnitForm` manages measurement units. It supports mapping base units, setting custom conversion ratios (multipliers), and renders a live, calculated text helper explaining the package conversion equation.

#### Props

```typescript
interface UnitFormProps {
  initialValues?: Unit;
  onSubmit: (values: UnitFormValues) => void;
  isPending: boolean;
}
```

---

### CategoryTree

`src/components/catalog/category-tree.tsx`

The `CategoryTree` component displays the multi-level category hierarchy recursively. It includes expand/collapse-all triggers, depth-indented vertical lines, active/inactive badges, product count tags, and a drag-and-drop Move handle layout foundation.

#### Props

```typescript
interface CategoryTreeProps {
  categories: Category[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}
```

---

## 3. Customer Management Components (Phase F5.1)

### CustomerAvatar

`src/components/customer/customer-avatar.tsx`

Displays a customer's profile photo or a deterministic gradient-background initials fallback. Color is derived from the customer's name so it remains consistent.

#### Props

```typescript
interface CustomerAvatarProps {
  customer: Pick<Customer, 'fullName' | 'firstName' | 'lastName'> & { avatarUrl?: string | null };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Default: 'md'
  className?: string;
}
```

#### Example Usage

```tsx
import { CustomerAvatar } from '@/components/customer/customer-avatar';
<CustomerAvatar customer={customer} size="lg" />;
```

---

### CustomerStatusBadge

`src/components/customer/customer-status-badge.tsx`

Renders a coloured status badge for `ACTIVE`, `INACTIVE`, or `ARCHIVED` customer states.

#### Props

```typescript
interface CustomerStatusBadgeProps {
  status: CustomerStatus; // 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  className?: string;
}
```

---

### CustomerDueBadge

`src/components/customer/customer-due-badge.tsx`

Displays the customer's outstanding balance. Green for zero, amber for moderate amounts, red for high (>10,000).

#### Props

```typescript
interface CustomerDueBadgeProps {
  balance: string; // currentBalance as string from API
  className?: string;
}
```

---

### CustomerCard

`src/components/customer/customer-card.tsx`

Compact card view showing avatar, name, customer code, contact info, due badge, and member since date. Suitable for grid layouts.

#### Props

```typescript
interface CustomerCardProps {
  customer: Customer;
  className?: string;
  onClick?: () => void;
}
```

---

### PaymentSummaryCard

`src/components/customer/payment-summary-card.tsx`

Four-metric card showing Total Purchase, Total Paid, Outstanding Due, and Credit Limit with a credit utilisation progress bar.

#### Props

```typescript
interface PaymentSummaryCardProps {
  totalPurchase?: number;
  totalPaid?: number;
  balance: string;
  creditLimit: string;
  className?: string;
}
```

---

### TransactionTimeline

`src/components/customer/transaction-timeline.tsx`

Vertical timeline of ledger entries. Each entry shows icon (per type), label, reference, amount with sign, and running balance. Includes an empty state.

#### Props

```typescript
interface TransactionTimelineProps {
  entries: CustomerLedgerEntry[];
  className?: string;
}
```

---

### CustomerForm

`src/components/customer/customer-form.tsx`

Full React Hook Form + Zod form for creating or editing a customer. Auto-populates when a `customer` prop is provided. Sections: Basic Info, Contact Info, Account Settings, Profile Photo, Notes.

#### Props

```typescript
interface CustomerFormProps {
  customer?: Customer; // Pre-fill for edit mode
  defaultValues?: Partial<CustomerFormSchema>;
  onSubmit: (values: CustomerFormSchema) => void;
  isPending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}
```

---

### CustomerFormSkeleton

`src/components/customer/customer-form-skeleton.tsx`

Skeleton placeholder matching the CustomerForm section layout, used while fetching customer data for edit mode.

---

### CustomerProfileSkeleton

`src/components/customer/customer-profile-skeleton.tsx`

Skeleton placeholder for the full customer profile page — header, metrics, tabs, and timeline rows.

---

## Customer Pages (Phase F5.1)

| Route                 | File                                           | Description                                                                |
| --------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| `/customers`          | `app/(dashboard)/customers/page.tsx`           | Enterprise DataTable with server pagination, search, filters, bulk actions |
| `/customers/new`      | `app/(dashboard)/customers/new/page.tsx`       | Create customer form                                                       |
| `/customers/:id`      | `app/(dashboard)/customers/[id]/page.tsx`      | Tabbed profile page (Overview, Transactions, Addresses, Notes)             |
| `/customers/:id/edit` | `app/(dashboard)/customers/[id]/edit/page.tsx` | Edit customer form with pre-filled data                                    |
| `/customers/archive`  | `app/(dashboard)/customers/archive/page.tsx`   | Archived customers with restore/delete                                     |

---

## 4. Supplier Management Components (Phase F5.2)

### SupplierAvatar

`src/components/supplier/supplier-avatar.tsx`

Displays a supplier's logo (if provided via `logoUrl`) or a gradient-coloured initials fallback derived from `companyName`. Uses rounded-xl corners to reflect a business/brand aesthetic.

| Prop       | Type                                                | Default |
| ---------- | --------------------------------------------------- | ------- |
| `supplier` | `{ companyName: string; logoUrl?: string \| null }` | —       |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`              | `'md'`  |

### SupplierStatusBadge

`src/components/supplier/supplier-status-badge.tsx`

Renders a colour-coded badge for `ACTIVE` (green), `INACTIVE` (amber), and `ARCHIVED` (grey) statuses.

### SupplierDueBadge

`src/components/supplier/supplier-due-badge.tsx`

Displays the outstanding supplier balance as a badge: green (`Settled`) when balance ≤ 0, amber for moderate dues, and red for balances above $50,000.

### SupplierCard

`src/components/supplier/supplier-card.tsx`

Compact grid/list card showing avatar, company name, supplier code, contact details (phone/email/website/address), due badge, and member-since date. Hover-animated, clickable.

### SupplierSummaryCard

`src/components/supplier/supplier-summary-card.tsx`

Four-metric card: **Total Purchase**, **Total Paid**, **Outstanding Due**, and **Credit Limit**, plus an animated credit utilisation progress bar (green < 50% → amber < 80% → red ≥ 80%).

### SupplierLedgerTable

`src/components/supplier/supplier-ledger-table.tsx`

Table-format ledger with entry-type icons (PURCHASE / PAYMENT / PURCHASE_RETURN), reference number, date, amount with sign prefix, and running balance. Includes loading skeleton and empty state.

### PaymentHistoryTable

`src/components/supplier/payment-history-table.tsx`

Payment list table with method icons (cash/bank/card/mobile/other), payment number, reference, date, status badge, and amount. Includes loading skeleton and empty state.

### PurchaseHistoryPlaceholder

`src/components/supplier/purchase-history-placeholder.tsx`

UI foundation for the Purchase History section with 4 sub-tabs: **Purchase Orders**, **GRN**, **Invoices**, **Returns**. Each shows a labelled placeholder pointing to the future Purchase Module (Phase B7).

### SupplierForm

`src/components/supplier/supplier-form.tsx`

Full-featured form with React Hook Form + Zod validation. Five sections: Business Information, Contact Information, Address, Account Settings, Notes. Supports create and edit modes via the `supplier` prop.

### SupplierFormSkeleton / SupplierProfileSkeleton

`src/components/supplier/supplier-form-skeleton.tsx`
`src/components/supplier/supplier-profile-skeleton.tsx`

Shimmer loading skeletons for the form and profile pages.

---

## Supplier Pages (Phase F5.2)

| Route                 | File                                           | Description                                                                        |
| --------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/suppliers`          | `app/(dashboard)/suppliers/page.tsx`           | Enterprise DataTable with server pagination, search, filters, bulk actions         |
| `/suppliers/new`      | `app/(dashboard)/suppliers/new/page.tsx`       | Create supplier form                                                               |
| `/suppliers/:id`      | `app/(dashboard)/suppliers/[id]/page.tsx`      | 5-tab profile (Overview, Ledger, Purchases, Payments, Notes) + inline address mgmt |
| `/suppliers/:id/edit` | `app/(dashboard)/suppliers/[id]/edit/page.tsx` | Edit supplier form with pre-filled data                                            |
| `/suppliers/archive`  | `app/(dashboard)/suppliers/archive/page.tsx`   | Archived suppliers with restore/delete                                             |

---

## 4. Warehouse & Branch Management Components (Phase F6.1)

### WarehouseCard

`src/components/warehouse/warehouse-card.tsx`

Compact grid card showing warehouse name, code, associated branch office, active manager, and real-time fill level progress bar.

### BranchCard

`src/components/warehouse/branch-card.tsx`

Summary panel for storefront outlets displaying manager name, active staff size, linked warehouses count, address, and contacts.

### CapacityCard

`src/components/warehouse/capacity-card.tsx`

Visual gauge highlighting cubic volumetric limits, utilized m³, remaining free storage, and over-capacity warnings (>90%).

### StorageLocationCard

`src/components/warehouse/storage-location-card.tsx`

Grid widget depicting individual warehouse bins (Zone, Rack, Shelf, Bin, Barcode, Status) with update triggers.

### UtilizationProgress

`src/components/warehouse/utilization-progress.tsx`

Premium color-coded utilization gauge: green (<70%), yellow (70-90%), and red (≥90%).

---

## Warehouse & Branch Pages (Phase F6.1)

| Route                  | File                                            | Description                                                                           |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/warehouses`          | `app/(dashboard)/warehouses/page.tsx`           | Depot directory & KPIs (online status, space utilization, and bulk archiving actions) |
| `/warehouses/new`      | `app/(dashboard)/warehouses/new/page.tsx`       | Register new depot with capacity details and branch affiliations                      |
| `/warehouses/:id`      | `app/(dashboard)/warehouses/[id]/page.tsx`      | Multi-tab profiles (overview, storage bins, stock logs, recent activity)              |
| `/warehouses/:id/edit` | `app/(dashboard)/warehouses/[id]/edit/page.tsx` | Edit form modifying phone, manager context, and storage environment                   |
| `/warehouses/archive`  | `app/(dashboard)/warehouses/archive/page.tsx`   | Archived depots list with restore buttons                                             |
| `/branches`            | `app/(dashboard)/branches/page.tsx`             | Multi-branch listing table detailing contact numbers and status tags                  |
| `/branches/new`        | `app/(dashboard)/branches/new/page.tsx`         | Form creating branch offices with Zod validation                                      |
| `/branches/:id`        | `app/(dashboard)/branches/[id]/page.tsx`        | Branch profiles with tabs for assigned staff and linked depots                        |
| `/branches/:id/edit`   | `app/(dashboard)/branches/[id]/edit/page.tsx`   | Edit form updating storefront name, contacts, and opening date                        |
| `/storage-locations`   | `app/(dashboard)/storage-locations/page.tsx`    | Central storage bins catalog supporting search by barcode, rack level, and zone       |
