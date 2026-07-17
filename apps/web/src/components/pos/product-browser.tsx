'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Grid,
  List,
  Layers,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useProducts } from '@/hooks/use-product';
import { useCategoriesList, useBrandsList } from '@/hooks/use-catalog';
import { usePOSStore } from '@/stores/pos.store';
import { ProductCard } from './product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductBrowser() {
  const {
    activeCategory,
    activeBrand,
    searchQuery,
    viewMode,
    setActiveCategory,
    setActiveBrand,
    setSearchQuery,
    setViewMode,
  } = usePOSStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync local search value
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(localSearch);
      setCurrentPage(1); // Reset page on query search
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [localSearch, setSearchQuery]);

  // Load categories and brands
  const { data: categoriesData, isLoading: loadingCats } = useCategoriesList({ limit: 100 });
  const { data: brandsData, isLoading: loadingBrands } = useBrandsList({ limit: 100 });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  // Load products based on queries
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError,
  } = useProducts({
    page: currentPage,
    limit: 12,
    q: searchQuery,
    categoryId: activeCategory || undefined,
    brandId: activeBrand || undefined,
    status: 'ACTIVE',
  });

  const productsList = productsData?.data || [];
  const meta = productsData?.meta;

  // Filter in-stock only in client side if necessary, or just rely on total items
  const displayedProducts = onlyInStock
    ? productsList.filter((p) => (p.stockSummary?.totalQuantity ?? 0) > 0)
    : productsList;

  const handleCategoryClick = (catId: string | null) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveBrand(val === 'all' ? null : val);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-background border-r border-border z-10 overflow-hidden select-none">
      {/* Search & Mode Headers */}
      <div className="p-3 bg-card/40 border-b border-border flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="pos-catalog-search-input"
            type="text"
            placeholder="Search catalog (Name, SKU, Barcode)... [F1]"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Brand select */}
          <div className="relative">
            <select
              value={activeBrand || 'all'}
              onChange={handleBrandChange}
              className="bg-card border border-border text-foreground rounded-md text-xs py-1.5 px-3 pr-8 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* In Stock toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={cn(
              'h-8 px-2.5 border text-xs gap-1',
              onlyInStock
                ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300'
                : 'border-border text-muted-foreground hover:bg-accent',
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">In Stock Only</span>
          </Button>

          {/* View mode toggle */}
          <div className="flex bg-accent p-0.5 border border-border rounded-lg">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-7 w-7 rounded-md p-0',
                viewMode === 'grid' && 'bg-emerald-600 text-white hover:bg-emerald-600',
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setViewMode('list')}
              className={cn(
                'h-7 w-7 rounded-md p-0',
                viewMode === 'list' && 'bg-emerald-600 text-white hover:bg-emerald-600',
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories ribbon scroll bar */}
      <div className="px-3 py-2 bg-muted/25 border-b border-border flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar whitespace-nowrap">
        <Button
          size="sm"
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'rounded-full text-xs px-3 h-7 font-bold border',
            activeCategory === null
              ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold'
              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground',
          )}
        >
          All Items
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            onClick={() => handleCategoryClick(cat.id)}
            className={cn(
              'rounded-full text-xs px-3 h-7 border font-bold',
              activeCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold'
                : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground',
            )}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Catalog items display area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="border border-border bg-muted/20 rounded-xl p-3 flex flex-col gap-3"
              >
                <Skeleton className="aspect-video w-full rounded-lg bg-accent" />
                <Skeleton className="h-4 w-3/4 rounded bg-accent" />
                <Skeleton className="h-3 w-1/2 rounded bg-accent" />
                <div className="flex justify-between items-center mt-2">
                  <Skeleton className="h-4 w-12 rounded bg-accent" />
                  <Skeleton className="h-7 w-20 rounded-lg bg-accent" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl m-4 bg-muted/10">
            <span className="text-xs text-rose-400 font-semibold mb-1">
              Failed to fetch product catalog.
            </span>
            <span className="text-[10px] text-muted-foreground">
              Verify client APIs are fully connected.
            </span>
          </div>
        ) : displayedProducts.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5'
                : 'flex flex-col gap-2',
            )}
          >
            {displayedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 text-muted-foreground">
            <Layers className="h-8 w-8 mb-2 text-slate-700 animate-pulse" />
            <p className="text-xs">No matching products found inside this branch.</p>
          </div>
        )}
      </div>

      {/* Footer Pager Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="px-4 py-2 border-t border-border bg-card/40 flex items-center justify-between shrink-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Showing <span className="text-foreground font-bold">{displayedProducts.length}</span> of{' '}
            <span className="text-foreground font-bold">{meta.total}</span> items
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 bg-card border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[10px] sm:text-xs font-mono px-2 text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-7 w-7 bg-card border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
