import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { Cart, CartItem, HeldOrder, RecentOrder, POSSettings } from '@/types/pos';
import type { Product } from '@/types/product';
import type { Customer } from '@/types/customer';
import { toast } from 'sonner';

interface POSState {
  carts: Cart[];
  activeCartId: string;
  heldOrders: HeldOrder[];
  recentOrders: RecentOrder[];
  settings: POSSettings;

  // Catalog Filters
  activeCategory: string | null;
  activeBrand: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';

  // Actions
  setActiveCartId: (id: string) => void;
  newCart: (name?: string) => string;
  closeCart: (id: string) => void;
  renameCart: (id: string, name: string) => void;
  duplicateCart: (id: string) => void;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  updateItemTax: (productId: string, tax: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  setCustomer: (customer: Customer | null) => void;
  updateGlobalDiscount: (discount: number) => void;
  updateGlobalTaxRate: (taxRate: number) => void;
  clearCart: () => void;

  // Hold operations
  holdOrder: (notes?: string) => void;
  resumeOrder: (heldOrderId: string) => void;
  deleteHeldOrder: (heldOrderId: string) => void;

  // Recent checkout operations
  addRecentOrder: (order: Omit<RecentOrder, 'id' | 'completedAt'>) => void;

  // Filter actions
  setActiveCategory: (catId: string | null) => void;
  setActiveBrand: (brandId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  updateSettings: (settings: Partial<POSSettings>) => void;
}

const defaultCart = (id: string, name: string): Cart => ({
  id,
  name,
  items: [],
  customerId: 'walk-in',
  customer: null,
  globalDiscount: 0,
  globalTaxRate: 10,
  warehouseId: null,
});

export const usePOSStore = create<POSState>()(
  devtools(
    persist(
      (set, get) => ({
        carts: [defaultCart('cart-1', 'Cart 1')],
        activeCartId: 'cart-1',
        heldOrders: [],
        recentOrders: [],
        settings: {
          receiptPrinterWidth: 80,
          barcodeScanningAutoAdd: true,
          defaultWarehouseId: '',
          defaultCustomerId: 'walk-in',
          cashDrawerTriggerCode: '27,112,0,25,250',
        },
        activeCategory: null,
        activeBrand: null,
        searchQuery: '',
        viewMode: 'grid',

        setActiveCartId: (id) => set({ activeCartId: id }),

        newCart: (name) => {
          const { carts } = get();
          const newId = `cart-${Date.now()}`;
          const newName = name || `Cart ${carts.length + 1}`;
          const cart = defaultCart(newId, newName);

          set({
            carts: [...carts, cart],
            activeCartId: newId,
          });
          toast.success(`Created new cart: ${newName}`);
          return newId;
        },

        closeCart: (id) => {
          const { carts, activeCartId } = get();
          if (carts.length <= 1) {
            toast.warning('Cannot close the only active shopping cart.');
            return;
          }

          const filtered = carts.filter((c) => c.id !== id);
          let newActiveId = activeCartId;

          if (activeCartId === id) {
            newActiveId = filtered[filtered.length - 1]?.id || '';
          }

          set({
            carts: filtered,
            activeCartId: newActiveId,
          });
          toast.info('Cart closed successfully.');
        },

        renameCart: (id, name) => {
          const { carts } = get();
          set({
            carts: carts.map((c) => (c.id === id ? { ...c, name } : c)),
          });
        },

        duplicateCart: (id) => {
          const { carts } = get();
          const found = carts.find((c) => c.id === id);
          if (!found) return;

          const newId = `cart-${Date.now()}`;
          const duplicated: Cart = {
            ...found,
            id: newId,
            name: `${found.name} (Copy)`,
            items: found.items.map((it) => ({ ...it })),
          };

          set({
            carts: [...carts, duplicated],
            activeCartId: newId,
          });
          toast.success(`Duplicated cart: ${duplicated.name}`);
        },

        addToCart: (product, quantity = 1) => {
          const { carts, activeCartId } = get();
          const activeCart = carts.find((c) => c.id === activeCartId);
          if (!activeCart) return;

          // Check stock
          const availableStock = product.stockSummary?.totalQuantity ?? 0;
          const currentItem = activeCart.items.find((it) => it.productId === product.id);
          const currentQty = currentItem?.quantity ?? 0;
          const targetQty = currentQty + quantity;

          if (product.status !== 'ACTIVE') {
            toast.error('This product is currently inactive.');
            return;
          }

          if (availableStock <= 0) {
            toast.warning(`Product is OUT OF STOCK. Proceeding with caution.`);
          } else if (targetQty > availableStock) {
            toast.warning(
              `Quantity requested (${targetQty}) exceeds current stock (${availableStock}).`,
            );
          }

          let updatedItems: CartItem[];
          if (currentItem) {
            updatedItems = activeCart.items.map((it) =>
              it.productId === product.id ? { ...it, quantity: it.quantity + quantity } : it,
            );
          } else {
            updatedItems = [
              ...activeCart.items,
              {
                productId: product.id,
                productName: product.name,
                sku: product.sku || '',
                barcode: product.barcode || '',
                unitPrice: product.sellingPrice,
                quantity,
                discount: 0,
                tax: product.tax?.percentage ?? 10,
                product,
              },
            ];
          }

          set({
            carts: carts.map((c) => (c.id === activeCartId ? { ...c, items: updatedItems } : c)),
          });
          toast.success(`Added ${product.name} to cart.`);
        },

        removeFromCart: (productId) => {
          const { carts, activeCartId } = get();
          const activeCart = carts.find((c) => c.id === activeCartId);
          if (!activeCart) return;

          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? { ...c, items: c.items.filter((it) => it.productId !== productId) }
                : c,
            ),
          });
        },

        updateQuantity: (productId, quantity) => {
          const { carts, activeCartId } = get();
          const activeCart = carts.find((c) => c.id === activeCartId);
          if (!activeCart) return;

          if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
          }

          const targetItem = activeCart.items.find((it) => it.productId === productId);
          if (targetItem?.product) {
            const availableStock = targetItem.product.stockSummary?.totalQuantity ?? 0;
            if (availableStock > 0 && quantity > availableStock) {
              toast.warning(`Quantity requested exceeds current stock (${availableStock}).`);
            }
          }

          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? {
                    ...c,
                    items: c.items.map((it) =>
                      it.productId === productId ? { ...it, quantity } : it,
                    ),
                  }
                : c,
            ),
          });
        },

        updateItemDiscount: (productId, discount) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? {
                    ...c,
                    items: c.items.map((it) =>
                      it.productId === productId ? { ...it, discount } : it,
                    ),
                  }
                : c,
            ),
          });
        },

        updateItemTax: (productId, tax) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? {
                    ...c,
                    items: c.items.map((it) => (it.productId === productId ? { ...it, tax } : it)),
                  }
                : c,
            ),
          });
        },

        updateItemNotes: (productId, notes) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? {
                    ...c,
                    items: c.items.map((it) =>
                      it.productId === productId ? { ...it, notes } : it,
                    ),
                  }
                : c,
            ),
          });
        },

        setCustomer: (customer) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? {
                    ...c,
                    customerId: customer ? customer.id : 'walk-in',
                    customer: customer ? (customer as any) : null,
                  }
                : c,
            ),
          });
          if (customer) {
            toast.success(`Customer linked: ${customer.fullName}`);
          }
        },

        updateGlobalDiscount: (discount) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId ? { ...c, globalDiscount: discount } : c,
            ),
          });
        },

        updateGlobalTaxRate: (taxRate) => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) => (c.id === activeCartId ? { ...c, globalTaxRate: taxRate } : c)),
          });
        },

        clearCart: () => {
          const { carts, activeCartId } = get();
          set({
            carts: carts.map((c) =>
              c.id === activeCartId
                ? { ...c, items: [], globalDiscount: 0, customerId: 'walk-in', customer: null }
                : c,
            ),
          });
          toast.info('Active shopping cart cleared.');
        },

        holdOrder: (notes) => {
          const { carts, activeCartId, heldOrders } = get();
          const activeCart = carts.find((c) => c.id === activeCartId);
          if (!activeCart || activeCart.items.length === 0) {
            toast.error('Cannot hold an empty cart.');
            return;
          }

          const newHeldOrder: HeldOrder = {
            id: `held-${Date.now()}`,
            cart: {
              ...activeCart,
              items: activeCart.items.map((it) => ({ ...it })),
            },
            heldAt: new Date().toISOString(),
            notes: notes || 'Cashier hold request',
          };

          // Clear active cart items
          const updatedCarts = carts.map((c) =>
            c.id === activeCartId ? defaultCart(c.id, c.name) : c,
          );

          set({
            heldOrders: [newHeldOrder, ...heldOrders],
            carts: updatedCarts,
          });
          toast.success(`Order placed on Hold successfully!`);
        },

        resumeOrder: (heldOrderId) => {
          const { heldOrders, carts, activeCartId } = get();
          const held = heldOrders.find((h) => h.id === heldOrderId);
          if (!held) return;

          // Swap active cart with held cart contents
          const updatedCarts = carts.map((c) =>
            c.id === activeCartId
              ? {
                  ...c,
                  items: held.cart.items,
                  customerId: held.cart.customerId,
                  customer: held.cart.customer,
                  globalDiscount: held.cart.globalDiscount,
                  globalTaxRate: held.cart.globalTaxRate,
                }
              : c,
          );

          set({
            carts: updatedCarts,
            heldOrders: heldOrders.filter((h) => h.id !== heldOrderId),
          });
          toast.success(`Resumed order into active workspace.`);
        },

        deleteHeldOrder: (heldOrderId) => {
          const { heldOrders } = get();
          set({
            heldOrders: heldOrders.filter((h) => h.id !== heldOrderId),
          });
          toast.info('Held order deleted.');
        },

        addRecentOrder: (order) => {
          const { recentOrders } = get();
          const newOrder: RecentOrder = {
            ...order,
            id: `rec-${Math.floor(1000 + Math.random() * 9000)}`,
            completedAt: new Date().toISOString(),
          };

          set({
            recentOrders: [newOrder, ...recentOrders].slice(0, 100), // Cap at 100 recent
          });
        },

        setActiveCategory: (catId) => set({ activeCategory: catId }),
        setActiveBrand: (brandId) => set({ activeBrand: brandId }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setViewMode: (mode) => set({ viewMode: mode }),

        updateSettings: (newSettings) =>
          set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      }),
      {
        name: 'epos_pos_terminal_store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          carts: state.carts,
          activeCartId: state.activeCartId,
          heldOrders: state.heldOrders,
          recentOrders: state.recentOrders,
          settings: state.settings,
        }),
      },
    ),
    { name: 'POSStore' },
  ),
);
