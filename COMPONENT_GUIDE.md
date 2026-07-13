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
