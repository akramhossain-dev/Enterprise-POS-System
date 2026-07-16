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

---

## 5. Inventory & Stock Management Components (Phase F6.2)

### StockStatusBadge

`src/components/inventory/stock-status-badge.tsx`

The `StockStatusBadge` renders the safety stock level status badge with indicator colors (emerald for safe, amber for low stock alert, and rose for depleted items).

#### Props

```typescript
interface StockStatusBadgeProps {
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  availableQuantity?: number;
  minimumQuantity?: number;
  className?: string;
}
```

---

### ExpiryBadge

`src/components/inventory/expiry-badge.tsx`

Performs client-side date computations on product batch shelf life, highlighting remaining days or showing expired alerts.

#### Props

```typescript
interface ExpiryBadgeProps {
  expiryDate?: string | Date | null;
  className?: string;
}
```

---

### InventoryCard

`src/components/inventory/inventory-card.tsx`

Vibrant KPI widget showing card metrics (e.g. Valuation, low stock counts, alert vectors) with zoom animations and trend signals.

#### Props

```typescript
interface InventoryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}
```

---

### StockTimeline

`src/components/inventory/stock-timeline.tsx`

Renders historic inventory movement transactions (opening stock, purchase inflows, sale depletions, transfers, adjustments) in a vertical responsive timeline.

#### Props

```typescript
interface StockTimelineProps {
  movements: StockMovement[] | InventoryLedger[];
  loading?: boolean;
}
```

---

## Inventory & Stock Management Pages (Phase F6.2)

| Route                     | File                                              | Description                                                                           |
| ------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/inventory`              | `app/(dashboard)/inventory/page.tsx`              | Central dashboard showing stock metrics, warehouse bar chart, and activity logs       |
| `/inventory/stock`        | `app/(dashboard)/inventory/stock/page.tsx`        | Master stock directory featuring filterable datatables and threshold update modals    |
| `/inventory/:id`          | `app/(dashboard)/inventory/[id]/page.tsx`         | In-depth inventory details (Valuation card, history ledger, batch list, serial lists) |
| `/inventory/low-stock`    | `app/(dashboard)/inventory/low-stock/page.tsx`    | Watchlist showing items currently running below safety stock minimums                 |
| `/inventory/out-of-stock` | `app/(dashboard)/inventory/out-of-stock/page.tsx` | Depletion panel indicating items completely sold out with replenishment badges        |
| `/inventory/expiring`     | `app/(dashboard)/inventory/expiring/page.tsx`     | Perishable batch listing sorted by expiry timelines                                   |
| `/inventory/batches`      | `app/(dashboard)/inventory/batches/page.tsx`      | Batch oversight dashboard supporting custom quarantine locks and expiry validations   |
| `/inventory/serials`      | `app/(dashboard)/inventory/serials/page.tsx`      | Serial numbers catalog supporting single and bulk registrations                       |
| `/inventory/history`      | `app/(dashboard)/inventory/history/page.tsx`      | Searchable and filterable transaction log table + vertical timeline views             |
| `/inventory/archived`     | `app/(dashboard)/inventory/archived/page.tsx`     | Searchable discontinued products catalog and decommissioned warehouses                |

---

## 6. Stock Adjustment & Stock Transfer Components (Phase F6.3)

### WarehouseSelector

`src/components/operations/warehouse-selector.tsx`

Dropdown menu component used to select active warehouse depots. Supports excluding a specific warehouse ID to avoid matching source and destination fields in stock transfer routines.

#### Props

```typescript
interface WarehouseSelectorProps {
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}
```

---

### ProductSelector

`src/components/operations/product-selector.tsx`

Searchable autocomplete dropdown for choosing catalog items. If `warehouseId` is provided, limits selections to products currently in stock at that specific facility.

#### Props

```typescript
interface ProductSelectorProps {
  warehouseId?: string;
  onSelect: (product: {
    id: string;
    name: string;
    sku?: string | null;
    availableQuantity?: number;
  }) => void;
  excludeIds?: string[];
  placeholder?: string;
}
```

---

### DifferenceIndicator

`src/components/operations/difference-indicator.tsx`

Quantified delta display mapping count discrepancies. Highlights positive inventory surplus in green and inventory shrinkage losses in red.

#### Props

```typescript
interface DifferenceIndicatorProps {
  systemQuantity: number;
  physicalQuantity: number | null;
  className?: string;
}
```

---

### ApprovalBadge

`src/components/operations/approval-badge.tsx`

Badge component visualizing current states of transfers, reconciliations, and count sessions (Draft, Pending, Approved, Completed, Rejected, Cancelled, In Transit).

#### Props

```typescript
interface ApprovalBadgeProps {
  status: string;
  className?: string;
}
```

---

## Stock Adjustment & Stock Transfer Pages (Phase F6.3)

| Route                        | File                                                  | Description                                                                               |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/inventory/adjustments`     | `app/(dashboard)/inventory/adjustments/page.tsx`      | Adjustment registry directory listing all manual adjustments and delta values             |
| `/inventory/adjustments/new` | `app/(dashboard)/inventory/adjustments/new/page.tsx`  | Zod-validated creation form supporting increase/decrease toggles and reason select lists  |
| `/inventory/adjustments/:id` | `app/(dashboard)/inventory/adjustments/[id]/page.tsx` | Detailed stock adjustment audit report including impact evaluations                       |
| `/inventory/transfers`       | `app/(dashboard)/inventory/transfers/page.tsx`        | Transit registry directory displaying transfer requests with bulk approval tools          |
| `/inventory/transfers/new`   | `app/(dashboard)/inventory/transfers/new/page.tsx`    | Creation wizard with line items table, source stock limits, and duplicate-depot guards    |
| `/inventory/transfers/:id`   | `app/(dashboard)/inventory/transfers/[id]/page.tsx`   | Timeline and control panels to approve/reject requests or log incoming cargo completion   |
| `/inventory/cycle-count`     | `app/(dashboard)/inventory/cycle-count/page.tsx`      | Active audit sessions directory supporting new session initiation dialogs                 |
| `/inventory/cycle-count/:id` | `app/(dashboard)/inventory/cycle-count/[id]/page.tsx` | Physical Stock Verification sheet supporting inline edits and reconciliation workflows    |
| `/inventory/damage-loss`     | `app/(dashboard)/inventory/damage-loss/page.tsx`      | Discrepancies oversight panel displaying breakage/loss writeoffs and inline logging forms |

---

## 5. Purchase Management Components (Phase F7.1)

### RequisitionForm

`apps/web/src/components/purchase/requisition-form.tsx`
Handles purchase requisition generation, details, item line updates, department selections, and status approvals.

### PurchaseOrderForm

`apps/web/src/components/purchase/purchase-order-form.tsx`
Configures purchase orders from approved requisitions, matching suppliers, unit pricing, taxes, shipping terms, and payment types.

---

## 6. Goods Receive & Supplier Invoice Components (Phase F7.2)

### GrnCard

`apps/web/src/components/receive/grn-card.tsx`
KPI dashboard indicator showing total receipts, draft files, and total intake valuation.

### ReceivingTimeline

`apps/web/src/components/receive/receiving-timeline.tsx`
Tracks step-by-step receiving operations: PO Placed -> Goods Received (GRN Draft) -> Inbound Committed -> Supplier Invoice Audited -> 3-Way Match Verified/Discrepancy Mismatch.

### BatchSelector

`apps/web/src/components/receive/batch-selector.tsx`
Inline row input providing batch number entries, manufacturing dates, and expiry date configs.

### SerialSelector

`apps/web/src/components/receive/serial-selector.tsx`
Modal picker listing asset serial codes, checking length constraints against received quantities.

### InvoiceCard

`apps/web/src/components/receive/invoice-card.tsx`
Detailed dashboard widget parsing vendor invoice subtotal, tax, discount, and grand total.

### VarianceBadge

`apps/web/src/components/receive/variance-badge.tsx`
Visual tag representing pricing and quantity deviations, indicating active exceptions.

### ReceivingSummaryCard

`apps/web/src/components/receive/receiving-summary-card.tsx`
Dashboard reconciliation banner outlining discrepancy counts and variance valuations.

---

## 7. Purchase Return, Credit Note & Debit Note Components (Phase F7.3)

### ReturnCard

`apps/web/src/components/purchase/return-card.tsx`
Metric card summarizing return claim volume, counts, valuations, and statuses.

### CreditNoteCard

`apps/web/src/components/purchase/credit-note-card.tsx`
Stylized, printable supplier credit note showing credit amount, supplier, reference return, and issue dates.

### DebitNoteCard

`apps/web/src/components/purchase/debit-note-card.tsx`
Charge-back invoice voucher displaying deducted balances, supplier name, and reference return ID.

### ReturnsApprovalTimeline

`apps/web/src/components/purchase/returns-approval-timeline.tsx`
Step-by-step indicator tracking return workflow stages: Draft -> Submitted (Pending Approval) -> Decision (Approved/Rejected) -> Finalized (Complete/Refund Settle).

### ReturnSummaryCard

`apps/web/src/components/purchase/return-summary-card.tsx`
Information dashboard grouping supplier contact card, warehouse address details, document reference type, return date, and attachments list.

### ReasonBadge

`apps/web/src/components/purchase/reason-badge.tsx`
Renders modern, distinct, and high contrast badges matching the return reasons (Damaged, Expired, Quality Issue, etc.).

### ReturnFinancialSummary

`apps/web/src/components/purchase/return-financial-summary.tsx`
Details subtotal return values, estimated tax adjustments, global discount deductions, grand total settlement values, and payment methods.

---

## Purchase Return Page Routes (Phase F7.3)

| Route                         | File                                                  | Description                                                                                       |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/purchase/returns`           | `app/(dashboard)/purchase/returns/page.tsx`           | Main active returns claim registry directory featuring searching, filtering, and bulk operations. |
| `/purchase/returns/dashboard` | `app/(dashboard)/purchase/returns/dashboard/page.tsx` | Metric dashboards detailing total return counts, total claim values, and recharts graphs.         |
| `/purchase/returns/history`   | `app/(dashboard)/purchase/returns/history/page.tsx`   | Chronological audit ledger mapping all log events, status changes, and operator comments.         |
| `/purchase/returns/new`       | `app/(dashboard)/purchase/returns/new/page.tsx`       | Return creation form validated via React Hook Form & Zod with dynamic supplier ref pulling.       |
| `/purchase/returns/:id`       | `app/(dashboard)/purchase/returns/[id]/page.tsx`      | Claims audit dashboard detailing timeline state transitions and approval buttons.                 |
| `/purchase/returns/:id/edit`  | `app/(dashboard)/purchase/returns/[id]/edit/page.tsx` | Claim edit screen allowing operators to update details for returns in DRAFT status.               |
| `/purchase/credit-notes`      | `app/(dashboard)/purchase/credit-notes/page.tsx`      | Directory displaying all supplier credit note records and print-ready options.                    |
| `/purchase/debit-notes`       | `app/(dashboard)/purchase/debit-notes/page.tsx`       | Directory listing supplier debit invoice adjustments and charge-back balances.                    |

---

## Point of Sale Components (Phase F8.1)

### CustomerSelector

`apps/web/src/components/pos/customer-selector.tsx`
Self-contained customer search combobox linked to customer API. Displays loyalty points, credit limit, and current balances dynamically.

### ProductCard

`apps/web/src/components/pos/product-card.tsx`
Displays product images, SKU, barcode, unit price, stock count indicators, and discount flags. Supports Grid and List views.

### ProductBrowser

`apps/web/src/components/pos/product-browser.tsx`
Product browser displaying category ribbons, brand selectors, only-in-stock switches, search inputs, and layout view options.

### ShoppingCart

`apps/web/src/components/pos/shopping-cart.tsx`
Cashier workspace listing items in cart, quantity increment/decrement toggles, inline note editors, and item discounts inputs.

### OrderSummaryPanel

`apps/web/src/components/pos/order-summary-panel.tsx`
Computes subtotal, tax rate, global discounts, and grand totals. Embeds calculator widgets and checkout overlays.

### CalculatorModal

`apps/web/src/components/pos/calculator-modal.tsx`
Cashier calculator overlay with numeric keypads supporting numeric entries and keyboard overrides.

### CheckoutModal

`apps/web/src/components/pos/checkout-modal.tsx`
Interactive payment dialog listing due totals, cash tender helpers ($10 to $500), payment methods, and change due calculations.

---

## POS Page Routes (Phase F8.1)

| Route                | File                                   | Description                                                                             |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `/pos`               | `app/(pos)/pos/page.tsx`               | Cashier workspace containing catalog lists, shopping cart panels, and scanner handlers. |
| `/pos/settings`      | `app/(pos)/pos/settings/page.tsx`      | Configurations for receipt roll dimensions, drawer escape signals, and defaults.        |
| `/pos/held-orders`   | `app/(pos)/pos/held-orders/page.tsx`   | Lists orders placed on hold, showing customers list and resume triggers.                |
| `/pos/recent-orders` | `app/(pos)/pos/recent-orders/page.tsx` | Compiles completed sales transactions and cash change logs.                             |

---

## Checkout & Receipt Components (Phase F8.2)

### ReceiptViewer

`apps/web/src/components/pos/receipt-viewer.tsx`
Self-contained 58mm/80mm thermal receipt compiler and print engine. Focuses date, cashiers details, product summaries, split payments, and mock barcodes.

### InvoiceViewer

`apps/web/src/components/pos/invoice-viewer.tsx`
A4 Invoice compiler providing corporate logo templates, company registration details, detailed itemized lists, and print actions.

### CashDrawerCard

`apps/web/src/components/pos/cash-drawer-card.tsx`
Check-in Starting Float setup drawer card. Monitors float details, Cash-In/Out balances, and compiled shift registers logs.

---

## POS Page Routes (Phase F8.2)

| Route               | File                                   | Description                                                                  |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `/pos/payments`     | `app/(pos)/pos/payments/page.tsx`      | Logs completed checkouts, paid amounts, payment splits, and cashier details. |
| `/pos/receipts`     | `app/(pos)/pos/receipts/page.tsx`      | Receipt copies index log with one-click reprint options.                     |
| `/pos/cash-drawer`  | `app/(pos)/pos/cash-drawer/page.tsx`   | Cashier shift session balance checks and drawer transactions log.            |
| `/pos/receipts/:id` | `app/(pos)/pos/receipts/[id]/page.tsx` | Dynamic ticket previewer supporting 58mm/80mm width specs.                   |
| `/pos/invoices/:id` | `app/(pos)/pos/invoices/[id]/page.tsx` | Dynamic A4 Invoice previewer with printing setups.                           |

---

## Sales Return & History Components (Phase F8.3)

### ReturnCard

`apps/web/src/components/pos/return-card.tsx`
Renders sales return summaries including return values, refund payment modes, date entries, and review status.

### ApprovalTimeline

`apps/web/src/components/pos/approval-timeline.tsx`
Renders returns pipeline nodes tracking progress: Draft -> Submitted -> Approved -> Cash Refund Settle.

### OrderTimeline

`apps/web/src/components/pos/order-timeline.tsx`
Traces cashier order lifecycle nodes: Placed -> Paid -> Returns Check -> Complete/Void.

---

## POS Page Routes (Phase F8.3)

| Route                    | File                                       | Description                                                                               |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `/pos/orders`            | `app/(pos)/pos/orders/page.tsx`            | Logs completed checkout orders with status filters (Paid, Voided, Returned).              |
| `/pos/orders/:id`        | `app/(pos)/pos/orders/[id]/page.tsx`       | Displays item lists, order summary details, print triggers, and supervisor void overlays. |
| `/pos/returns`           | `app/(pos)/pos/returns/page.tsx`           | Claims directory displaying active return statuses and supervisor decision buttons.       |
| `/pos/returns/dashboard` | `app/(pos)/pos/returns/dashboard/page.tsx` | Visual indicators detailing monthly returns count, defective stats, and upsells.          |
| `/pos/returns/new`       | `app/(pos)/pos/returns/new/page.tsx`       | React Hook Form and Zod return creation page supporting partial swaps and exchanges.      |
| `/pos/returns/:id`       | `app/(pos)/pos/returns/[id]/page.tsx`      | Displays goods returned, condition indicators, reasons, and cash refund approvals.        |
| `/pos/refunds`           | `app/(pos)/pos/refunds/page.tsx`           | Chronological cash reversal registry listing settlement statuses.                         |

---

## Accounting & Finance Components (Phase F9.1)

### FinancialSummaryCard

`apps/web/src/components/accounting/financial-summary-card.tsx`
Renders corporate accounting financial summary metrics with percentage variances and icon tags.

### AccountTree

`apps/web/src/components/accounting/account-tree.tsx`
Recursive, collapsible parent-child hierarchy visualizer with indentation grids.

### BalanceBadge

`apps/web/src/components/accounting/balance-badge.tsx`
Render badges matching balance types (Debit/Credit) and account status flags.

---

## Accounting Page Routes (Phase F9.1)

| Route                           | File                                                     | Description                                                                              |
| ------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/accounting`                   | `app/(dashboard)/accounting/page.tsx`                    | Accounting dashboard outlining assets, liabilities, income, expenses, and profit ratios. |
| `/accounting/accounts`          | `app/(dashboard)/accounting/accounts/page.tsx`           | Chart of accounts listing, featuring tree-hierarchies and tables.                        |
| `/accounting/accounts/new`      | `app/(dashboard)/accounting/accounts/new/page.tsx`       | Zod-validated creation form supporting parent linkages and opening float entries.        |
| `/accounting/accounts/:id`      | `app/(dashboard)/accounting/accounts/[id]/page.tsx`      | Account details audit and description overview details page.                             |
| `/accounting/accounts/:id/edit` | `app/(dashboard)/accounting/accounts/[id]/edit/page.tsx` | Form screen allowing updates to account codes, types, and parent nodes.                  |
| `/accounting/accounts/archived` | `app/(dashboard)/accounting/accounts/archived/page.tsx`  | Registry containing archived accounts with restore utilities.                            |
| `/accounting/groups`            | `app/(dashboard)/accounting/groups/page.tsx`             | CRUD operations manager to cluster ledger groups.                                        |
| `/accounting/categories`        | `app/(dashboard)/accounting/categories/page.tsx`         | CRUD operations manager to sub-classify group accounts.                                  |

---

## Accounting & Finance Components (Phase F9.2)

### DebitCreditEntry

`apps/web/src/components/accounting/debit-credit-entry.tsx`
Renders the double-entry journal line-items editor. Features dynamic row injection, account selectors, debit and credit input filters, and real-time balancing difference indicators.

### LedgerTable

`apps/web/src/components/accounting/ledger-table.tsx`
A high-performance grid table optimized for General Ledger and Account Ledger datasets. Features sorting, pagination helpers, transaction-type badge indicators, and CSV export callbacks.

### TransactionTimeline

`apps/web/src/components/accounting/transaction-timeline.tsx`
Displays a vertical visual timeline tracing account ledger movements with customized icon badges representing source transaction types.

### VoucherCard

`apps/web/src/components/accounting/voucher-card.tsx`
A grid card widget summarizing payment or receipt vouchers. Focuses payees, received-from metadata, payment methods, references, dates, approval actions, and printable sheet triggers.

### BalanceSummary

`apps/web/src/components/accounting/balance-summary.tsx`
A four-metric summary banner showing Opening Balance, Total Inflows, Total Outflows, and Closing Balances.

### Skeletons

`apps/web/src/components/accounting/accounting-skeletons.tsx`
Provides loading shimmer screens for tables, ledgers, and forms.

---

## Accounting Page Routes (Phase F9.2)

| Route                           | File                                                     | Description                                                                       |
| ------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `/accounting/journals`          | `app/(dashboard)/accounting/journals/page.tsx`           | Index of journal entries, featuring status filters, searching, and bulk actions.  |
| `/accounting/journals/new`      | `app/(dashboard)/accounting/journals/new/page.tsx`       | Double-entry journal wizard with real-time balance validation checks.             |
| `/accounting/journals/:id`      | `app/(dashboard)/accounting/journals/[id]/page.tsx`      | Sheet previewing journal entries lines with Post/Approve/Cancel/Reverse controls. |
| `/accounting/journals/:id/edit` | `app/(dashboard)/accounting/journals/[id]/edit/page.tsx` | Form screen to edit entries currently in DRAFT status.                            |
| `/accounting/general-ledger`    | `app/(dashboard)/accounting/general-ledger/page.tsx`     | Merged ledger sheet outlining all transactions across accounts.                   |
| `/accounting/account-ledger`    | `app/(dashboard)/accounting/account-ledger/page.tsx`     | Detail view tracing timelines and balances for single accounts.                   |
| `/accounting/income`            | `app/(dashboard)/accounting/income/page.tsx`             | Log operational revenue receipts and categorise inflows.                          |
| `/accounting/expense`           | `app/(dashboard)/accounting/expense/page.tsx`            | Log operational expenses and process payouts.                                     |
| `/accounting/cash-book`         | `app/(dashboard)/accounting/cash-book/page.tsx`          | Petty Cash registers book showing daily safes inflows/outflows.                   |
| `/accounting/bank-book`         | `app/(dashboard)/accounting/bank-book/page.tsx`          | Bank deposits/withdrawals statement registry.                                     |
| `/accounting/payment-vouchers`  | `app/(dashboard)/accounting/payment-vouchers/page.tsx`   | Outbound payment voucher management and printable layouts.                        |
| `/accounting/receipt-vouchers`  | `app/(dashboard)/accounting/receipt-vouchers/page.tsx`   | Inward receipt voucher management and printable receipt slips.                    |

---

## Accounting & Finance Components (Phase F9.3)

### FinancialKpiCard

`apps/web/src/components/accounting/financial-kpi-card.tsx`
Renders financial KPIs, including revenue trends, operating expenses, and net margin outcomes, with sparkline charts and variance tags.

### StatementViewer

`apps/web/src/components/accounting/statement-viewer.tsx`
A template to render standard double-column spreadsheet reports with subtotal styles, printable layouts, and CSV export callbacks.

### TaxSummaryCard

`apps/web/src/components/accounting/tax-summary-card.tsx`
Displays sales tax collections, purchase tax offset offset assets, and calculated net tax liability dues.

### ClosingChecklist

`apps/web/src/components/accounting/closing-checklist.tsx`
Interactive closing desk checklist mapping bank reconciliations, trial balance checks, and final ledger freeze signature controls.

### FiscalCalendar

`apps/web/src/components/accounting/fiscal-calendar.tsx`
An interactive period lock manager listing accounting periods and open/closed/locked toggles.

### AuditTimeline

`apps/web/src/components/accounting/audit-timeline.tsx`
A timeline tracking compliance audit trails, userName actions, timestamps, and IP addresses.

---

## Accounting Page Routes (Phase F9.3)

| Route                                  | File                                                           | Description                                                                    |
| -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `/accounting/statements/profit-loss`   | `app/(dashboard)/accounting/statements/profit-loss/page.tsx`   | Profit & Loss statement detailing revenue, COGS, opex, and net profit.         |
| `/accounting/statements/balance-sheet` | `app/(dashboard)/accounting/statements/balance-sheet/page.tsx` | Balance Sheet outlining assets, liabilities, and owner equity calculations.    |
| `/accounting/statements/cash-flow`     | `app/(dashboard)/accounting/statements/cash-flow/page.tsx`     | Cash Flow statement tracking operating, investing, and financing liquid moves. |
| `/accounting/statements/trial-balance` | `app/(dashboard)/accounting/statements/trial-balance/page.tsx` | Trial Balance sheet checking double-entry equality with error indicators.      |
| `/accounting/tax`                      | `app/(dashboard)/accounting/tax/page.tsx`                      | Tax Dashboard mapping Collected vs Paid allocations alongside trend graphs.    |
| `/accounting/tax/rates`                | `app/(dashboard)/accounting/tax/rates/page.tsx`                | Setup screen for tax rate thresholds (VAT/GST/Sales/Purchase) and groups.      |
| `/accounting/tax/reports`              | `app/(dashboard)/accounting/tax/reports/page.tsx`              | Tax transactions ledger reports with print layouts and CSV downloads.          |
| `/accounting/periods`                  | `app/(dashboard)/accounting/periods/page.tsx`                  | Period lock setups and fiscal year calendar controls.                          |
| `/accounting/closing`                  | `app/(dashboard)/accounting/closing/page.tsx`                  | Month-end, quarter, and year-end closing controls and checklists.              |
| `/accounting/audit`                    | `app/(dashboard)/accounting/audit/page.tsx`                    | Security audit trails and compliance activity log registries.                  |

---

## Business Analytics & Executive Components (Phase F10.1)

### ChartCard

`apps/web/src/components/analytics/chart-card.tsx`
Unified Recharts adapter card displaying responsive Area, Bar, Line, or Pie graphs. Includes timeframe selectors and CSV export handlers.

### LeaderboardCard

`apps/web/src/components/analytics/leaderboard-card.tsx`
Progress bar rankings list mapping top products, customer tiers, and top suppliers.

### StatisticsCard

`apps/web/src/components/analytics/statistics-card.tsx`
Ratios metrics tracking block illustrating average order sizes, conversion rates, and turnover speeds.

### Skeletons

`apps/web/src/components/analytics/analytics-skeletons.tsx`
Loading shimmer placeholders for dashboard grids, widgets, and charts.

---

## Business Analytics Page Routes (Phase F10.1)

| Route                  | File                                           | Description                                                                                        |
| ---------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/analytics/dashboard` | `app/(dashboard)/analytics/dashboard/page.tsx` | Executive Dashboard with drag & drop customize layouts and real-time auto sync.                    |
| `/analytics/overview`  | `app/(dashboard)/analytics/overview/page.tsx`  | Central Business Overview charting margins, conversion ratios, and procurement trends.             |
| `/analytics/sales`     | `app/(dashboard)/analytics/sales/page.tsx`     | Sales Analytics tracking product categories, popular brands, and payment methods.                  |
| `/analytics/purchase`  | `app/(dashboard)/analytics/purchase/page.tsx`  | Purchase Analytics monitoring supplier invoice values, outstanding credit limits, and debit notes. |
| `/analytics/inventory` | `app/(dashboard)/analytics/inventory/page.tsx` | Inventory Analytics mapping storage asset value values, turnover velocities, and low stock lists.  |
| `/analytics/customer`  | `app/(dashboard)/analytics/customer/page.tsx`  | Customer Analytics charting database cohort growths, loyalty points, and active segments.          |
| `/analytics/supplier`  | `app/(dashboard)/analytics/supplier/page.tsx`  | Supplier Analytics highlighting vendor deliveries, lead delays, and purchase shares.               |
| `/analytics/branch`    | `app/(dashboard)/analytics/branch/page.tsx`    | Branch Analytics comparing local branch performance parameters, sales volumes, and profits.        |
| `/analytics/warehouse` | `app/(dashboard)/analytics/warehouse/page.tsx` | Warehouse Analytics tracing storage occupancy percentages and item volumes.                        |
| `/analytics/employee`  | `app/(dashboard)/analytics/employee/page.tsx`  | Employee Analytics displaying checkout representative POS sales and logs.                          |
