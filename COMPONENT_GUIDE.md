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
