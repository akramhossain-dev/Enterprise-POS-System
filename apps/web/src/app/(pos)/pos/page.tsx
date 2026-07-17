'use client';

import React, { useEffect } from 'react';
import { usePOSStore } from '@/stores/pos.store';
import { useProducts } from '@/hooks/use-product';
import { ProductBrowser } from '@/components/pos/product-browser';
import { ShoppingCart } from '@/components/pos/shopping-cart';
import { OrderSummaryPanel } from '@/components/pos/order-summary-panel';
import { toast } from 'sonner';

export default function POSTerminalPage() {
  const {
    carts,
    activeCartId,
    newCart,
    holdOrder,
    addToCart,
    searchQuery,
    setSearchQuery,
    settings,
  } = usePOSStore();

  const activeCart = carts.find((c) => c.id === activeCartId);

  // Hook to fetch product for scanner matching
  const { data: allProductsData } = useProducts({
    limit: 100,
    status: 'ACTIVE',
  });
  const allProducts = allProductsData?.data || [];

  // Barcode Auto-Scanner listener
  useEffect(() => {
    if (!settings.barcodeScanningAutoAdd || !searchQuery.trim()) return;

    // Check if query exactly matches a product's barcode or SKU
    const match = allProducts.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === searchQuery.toLowerCase().trim()) ||
        (p.sku && p.sku.toLowerCase() === searchQuery.toLowerCase().trim()),
    );

    if (match) {
      addToCart(match, 1);
      setSearchQuery(''); // Flush search input instantly!
      toast.success(`Barcode Scanned: ${match.name} added to cart.`);
    }
  }, [searchQuery, allProducts, settings.barcodeScanningAutoAdd, addToCart, setSearchQuery]);

  // Global Keyboard Shortcuts capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey } = e;

      // F1: Focus Search Input
      if (key === 'F1') {
        e.preventDefault();
        const searchInput = document.getElementById('pos-catalog-search-input');
        if (searchInput) {
          searchInput.focus();
          (searchInput as HTMLInputElement).select();
        }
      }

      // F2: Focus Customer Selector Trigger (will simulate click or open dropdown)
      if (key === 'F2') {
        e.preventDefault();
        toast.info('Linking customer selected.');
      }

      // F3: Hold Cart Order
      if (key === 'F3') {
        e.preventDefault();
        if (activeCart && activeCart.items.length > 0) {
          holdOrder('Quick cashier hold');
        } else {
          toast.warning('Cannot hold an empty cart.');
        }
      }

      // F4: New Cart Workspace
      if (key === 'F4') {
        e.preventDefault();
        newCart();
      }

      // F5: Alert global discount details
      if (key === 'F5') {
        e.preventDefault();
        toast.info('Use discount drawer at bottom right to add deductions.');
      }

      // F6: Complete checkout overlay trigger
      if (key === 'F6') {
        e.preventDefault();
        toast.info('Click Checkout to select payment options.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCart, holdOrder, newCart]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden bg-background">
      {/* Left section: Category Browser & Product Catalog grid */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ProductBrowser />
      </div>

      {/* Right section: Multi-Cart details list & Checkout pricing summaries */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-l border-border bg-cardard shrink-0 h-full overflow-hidden">
        {/* Shopping Cart List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ShoppingCart />
        </div>

        {/* Order pricing summary totals and actions */}
        <OrderSummaryPanel />
      </div>
    </div>
  );
}
