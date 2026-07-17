'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, AlertCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Product } from '@/types/product';
import { usePOSStore } from '@/stores/pos.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addToCart } = usePOSStore();
  const availableStock = product.stockSummary?.totalQuantity ?? 0;

  // Determine Stock Status UI properties
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 10;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const formattedPrice = `$${Number(product.sellingPrice).toFixed(2)}`;

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleAdd}
        className={cn(
          'flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none',
          isOutOfStock
            ? 'bg-muted/20 border-border opacity-60 hover:opacity-85'
            : 'bg-card border-border hover:border-slate-700 hover:bg-accent/60',
        )}
      >
        <div className="flex items-center space-x-3 min-w-0">
          {/* Thumb */}
          <div className="relative h-12 w-12 rounded-lg bg-accent overflow-hidden flex-shrink-0 border border-border">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold uppercase">
                {product.name.slice(0, 2)}
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-[8px] text-rose-400 font-extrabold uppercase tracking-wider">
                  Out
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="text-left min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">{product.name}</h4>
            <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
              <span>SKU: {product.sku || 'N/A'}</span>
              <span>•</span>
              <span className="truncate">Bar: {product.barcode || 'N/A'}</span>
            </div>
            {/* Stock status indicator */}
            <div className="mt-1 flex items-center space-x-1.5">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500',
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {isOutOfStock
                  ? 'Out of stock'
                  : isLowStock
                    ? `${availableStock} Low stock`
                    : `${availableStock} Available`}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-400 font-mono">{formattedPrice}</p>
            {product.tax && (
              <p className="text-[9px] text-muted-foreground font-mono">
                Tax: {product.tax.percentage}%
              </p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAdd}
            className="h-8 w-8 rounded-lg bg-emerald-950/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // GRID VIEW (Default)
  return (
    <div
      onClick={handleAdd}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer select-none',
        isOutOfStock
          ? 'bg-muted/20 border-border opacity-60 hover:opacity-85'
          : 'bg-card border-border hover:border-slate-700 hover:bg-accent/40 hover:shadow-xl hover:shadow-emerald-950/5',
      )}
    >
      {/* Product Image cover */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden border-b border-border">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-accent/60 flex items-center justify-center text-xs text-slate-600 font-black tracking-widest uppercase">
            {product.name.slice(0, 3)}
          </div>
        )}

        {/* Low Stock Indicator Pills */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <Badge
              variant="destructive"
              className="text-[8px] tracking-wider font-extrabold uppercase px-1.5 py-0.5"
            >
              Out of stock
            </Badge>
          ) : isLowStock ? (
            <Badge className="bg-amber-600 text-slate-900 text-[8px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 border-none hover:bg-amber-600">
              Low Stock: {availableStock}
            </Badge>
          ) : null}
        </div>

        {/* Category badge */}
        {product.category && (
          <span className="absolute bottom-2 left-2 text-[9px] font-semibold bg-accent/80 backdrop-blur border border-border text-foreground px-1.5 py-0.5 rounded">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Details Box */}
      <div className="p-3 text-left flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground line-clamp-2 min-h-8 mb-1 leading-snug group-hover:text-emerald-400 transition-colors duration-200">
            {product.name}
          </h4>
          <p className="text-[10px] text-muted-foreground font-mono tracking-tight truncate">
            SKU: {product.sku || 'N/A'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-400 font-mono tracking-wider">
              {formattedPrice}
            </span>
            {isOutOfStock ? (
              <p className="text-[9px] text-rose-500 font-medium">Reorder needed</p>
            ) : (
              <p className="text-[9px] text-muted-foreground font-mono">Stock: {availableStock}</p>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAdd}
            className="h-7 px-2.5 rounded-lg text-[10px] bg-accent border border-border hover:bg-emerald-500 hover:text-white text-emerald-400 font-bold transition-all duration-200"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
