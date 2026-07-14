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
