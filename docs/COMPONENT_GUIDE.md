# Component Guide — Enterprise POS System

> Phase F1 — Component Library Reference

## Overview

All reusable components live in `apps/web/src/components/`. They are built on top of Radix UI primitives with Tailwind CSS v4 styling and follow the design token system defined in `globals.css`.

---

## UI Components (`components/ui/`)

### Button

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="xs">XS</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>

// States
<Button loading>Loading…</Button>
<Button leftIcon={<Plus />}>Add Item</Button>
<Button rightIcon={<ArrowRight />}>Continue</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/input';

<Input
  label="Email"
  type="email"
  placeholder="you@company.com"
  error="Email is required"
  hint="We'll never share your email"
  leftElement={<Mail className="w-4 h-4" />}
  required
/>;
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  label="Description"
  placeholder="Enter description…"
  error={errors.description?.message}
  rows={4}
/>;
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" dot>Active</Badge>
<Badge variant="outline-destructive">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

### Avatar

```tsx
import { Avatar } from '@/components/ui/avatar';

<Avatar src="/user.jpg" alt="John Doe" fallback="JD" size="md" status="online" />;
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card hover glass>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>$12,500</CardContent>
  <CardFooter>+12% from last month</CardFooter>
</Card>;
```

### Skeleton

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-32" />
<Skeleton variant="circular" className="w-10 h-10" />
<SkeletonCard />
<SkeletonTable rows={5} />
```

### Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Record</DialogTitle>
      <DialogDescription>Make changes and save.</DialogDescription>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### Sheet

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Drawer</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Details</SheetTitle>
    </SheetHeader>
    <SheetBody>{/* content */}</SheetBody>
    <SheetFooter>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>;
```

### Alert

```tsx
import { Alert } from "@/components/ui/alert";

<Alert
  variant="success"
  title="Saved!"
  description="Your changes have been saved."
  dismissible
  onDismiss={() => {}}
/>

<Alert variant="destructive" title="Error" description="Something went wrong." />
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="details">Details content</TabsContent>
</Tabs>;
```

### Tooltip

```tsx
import { SimpleTooltip } from '@/components/ui/tooltip';

<SimpleTooltip content="More information" side="top">
  <Button size="icon" variant="ghost">
    <Info />
  </Button>
</SimpleTooltip>;
```

### EmptyState / ErrorState

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

<EmptyState
  title="No products yet"
  description="Add your first product to get started."
  action={{ label: "Add Product", onClick: handleAdd }}
/>

<ErrorState
  title="Failed to load"
  description="Could not fetch products."
  onRetry={refetch}
/>
```

### Pagination

```tsx
import { Pagination } from '@/components/ui/pagination';

<Pagination
  page={page}
  pageSize={25}
  total={500}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>;
```

### SearchBox

```tsx
import { SearchBox } from '@/components/ui/search-box';

<SearchBox
  onSearch={(value) => setSearch(value)}
  debounceMs={300}
  placeholder="Search products…"
/>;
```

### Spinner / LoadingOverlay

```tsx
import { Spinner } from "@/components/ui/spinner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

<Spinner size="md" className="text-primary" />

<div className="relative">
  <LoadingOverlay visible={isSaving} message="Saving…" />
  {/* content */}
</div>
```

---

## Data Table (`components/data-table/`)

```tsx
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Product = { id: string; name: string; price: number; stock: number };

const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Name", enableSorting: true },
  { accessorKey: "price", header: "Price", cell: ({ row }) => formatCurrency(row.original.price) },
  { accessorKey: "stock", header: "Stock" },
];

// Client-side
<DataTable columns={columns} data={products} loading={isLoading} />

// Server-side pagination
<DataTable
  columns={columns}
  data={products}
  loading={isLoading}
  totalCount={500}
  page={page}
  pageSize={25}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  enableRowSelection
  onRowSelectionChange={(rows) => setSelected(rows)}
/>
```

---

## Modal System (`components/modals/`)

```tsx
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { DeleteDialog } from "@/components/modals/delete-dialog";

const [open, setOpen] = useState(false);

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirm Archive"
  description="Archive this product?"
  onConfirm={handleArchive}
/>

<DeleteDialog
  open={open}
  onOpenChange={setOpen}
  itemName="Laptop Pro X1"
  onDelete={handleDelete}
  loading={isDeleting}
/>
```

---

## File Upload (`components/upload/`)

```tsx
import { FileUpload } from '@/components/upload/file-upload';

<FileUpload
  onFilesAccepted={(files) => setFiles(files)}
  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
  maxSize={5 * 1024 * 1024}
  multiple
  maxFiles={3}
  label="Upload product images"
  hint="JPG, PNG, WebP up to 5MB"
/>;
```

---

## Auth Guards (`components/auth/`)

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { RoleGuard } from "@/components/auth/role-guard";

// Redirect to login if not authenticated
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Show only with permission
<PermissionGuard permission="products:create">
  <Button>Add Product</Button>
</PermissionGuard>

// Show only with role
<RoleGuard roles={["admin", "super_admin"]}>
  <AdminPanel />
</RoleGuard>
```

---

## Layout Components (`components/layout/`)

| Component            | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `<Sidebar />`        | Collapsible sidebar with permission-filtered nav      |
| `<TopNavbar />`      | Sticky navbar with search, notifications, theme, user |
| `<Breadcrumb />`     | Auto-generated from pathname                          |
| `<UserMenu />`       | Dropdown with profile, settings, logout               |
| `<ThemeSwitcher />`  | Light / Dark / System dropdown                        |
| `<CommandPalette />` | ⌘K command palette with navigation                    |

---

## Hooks Reference

| Hook                     | Purpose                           |
| ------------------------ | --------------------------------- |
| `useAuth()`              | Auth state + login/logout actions |
| `usePermissions()`       | Permission & role helpers         |
| `useDebounce(value, ms)` | Debounce any value                |
| `useMediaQuery(query)`   | Match CSS media query             |
| `useIsMobile()`          | Shorthand for `max-width: 767px`  |
| `useIsDesktop()`         | Shorthand for `min-width: 1024px` |

---

## Naming Conventions

- **Components**: PascalCase (`UserMenu`, `DataTable`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useDebounce`)
- **Stores**: camelCase with `Store` suffix (`useAuthStore`)
- **Services**: camelCase with `Service` suffix (`authService`)
- **Types**: PascalCase (`User`, `ApiResponse<T>`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Files**: kebab-case (`user-menu.tsx`, `auth.service.ts`)
