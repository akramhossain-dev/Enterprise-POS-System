'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  MessageSquareCode,
  DollarSign,
  Copy,
  FolderMinus,
  PencilLine,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { usePOSStore } from '@/stores/pos.store';
import { CustomerSelector } from './customer-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export function ShoppingCart() {
  const {
    carts,
    activeCartId,
    setActiveCartId,
    newCart,
    closeCart,
    renameCart,
    duplicateCart,
    updateQuantity,
    removeFromCart,
    updateItemDiscount,
    updateItemNotes,
  } = usePOSStore();

  const activeCart = carts.find((c) => c.id === activeCartId);
  const items = activeCart?.items || [];

  // Dropdown & rename states
  const [showCartActions, setShowCartActions] = useState(false);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [tempCartName, setTempCartName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Inline row editors
  const [activeRowEdit, setActiveRowEdit] = useState<{
    productId: string;
    field: 'notes' | 'discount' | null;
  }>({
    productId: '',
    field: null,
  });

  const handleStartRename = (id: string, name: string) => {
    setEditingCartId(id);
    setTempCartName(name);
    setShowCartActions(false);
  };

  const handleSaveRename = (id: string) => {
    if (tempCartName.trim()) {
      renameCart(id, tempCartName.trim());
      setEditingCartId(null);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCartActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRowEdit = (productId: string, field: 'notes' | 'discount') => {
    if (activeRowEdit.productId === productId && activeRowEdit.field === field) {
      setActiveRowEdit({ productId: '', field: null });
    } else {
      setActiveRowEdit({ productId, field });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c1220] border-l border-slate-900 overflow-hidden select-none">
      {/* Multi-Cart Tabs Navigation */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-900 bg-slate-950/20 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar max-w-[80%] whitespace-nowrap">
          {carts.map((cart) => {
            const isActive = cart.id === activeCartId;
            return (
              <div key={cart.id} className="relative group shrink-0">
                {editingCartId === cart.id ? (
                  <Input
                    type="text"
                    value={tempCartName}
                    onChange={(e) => setTempCartName(e.target.value)}
                    onBlur={() => handleSaveRename(cart.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(cart.id)}
                    className="h-7 w-24 bg-slate-900 border-emerald-500 text-slate-100 text-xs px-2"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setActiveCartId(cart.id)}
                    onDoubleClick={() => handleStartRename(cart.id, cart.name)}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 border transition-all',
                      isActive
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-md shadow-emerald-500/10'
                        : 'bg-[#080d19] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200',
                    )}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                    <span>{cart.name}</span>
                    <span className="text-[10px] opacity-80">({cart.items.length})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Carts Action Dropdown */}
        <div className="flex items-center space-x-1.5 shrink-0 relative" ref={menuRef}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => newCart()}
            className="h-7 w-7 rounded-md bg-[#080d19] border border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-900"
            title="Create New Cart [F4]"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          {activeCart && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowCartActions(!showCartActions)}
                className="h-7 w-7 rounded-md bg-[#080d19] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>

              {showCartActions && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#0c1220] border border-slate-850 rounded-lg shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={() => handleStartRename(activeCart.id, activeCart.name)}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-900 flex items-center"
                  >
                    <PencilLine className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    Rename Cart
                  </button>
                  <button
                    onClick={() => {
                      duplicateCart(activeCart.id);
                      setShowCartActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-900 flex items-center"
                  >
                    <Copy className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    Duplicate Cart
                  </button>
                  <button
                    onClick={() => {
                      closeCart(activeCart.id);
                      setShowCartActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/20 flex items-center"
                  >
                    <FolderMinus className="h-3.5 w-3.5 mr-2" />
                    Close Cart
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Customer Selector Block */}
      <div className="p-3 bg-slate-950/10 border-b border-slate-900 shrink-0">
        <CustomerSelector />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar min-h-0">
        {items.length > 0 ? (
          items.map((item) => {
            const lineSubtotal = item.quantity * item.unitPrice - item.discount;
            const isEditingThisNotes =
              activeRowEdit.productId === item.productId && activeRowEdit.field === 'notes';
            const isEditingThisDiscount =
              activeRowEdit.productId === item.productId && activeRowEdit.field === 'discount';

            return (
              <div
                key={item.productId}
                className="flex flex-col border border-slate-850 bg-[#0c1220] rounded-xl p-2.5 shadow-sm transition-all"
              >
                {/* Product primary row */}
                <div className="flex items-start justify-between gap-2.5 text-left">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200 leading-tight line-clamp-1">
                      {item.productName}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ${item.unitPrice.toFixed(2)} each | SKU: {item.sku}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors duration-150 shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Line details badges */}
                {(item.notes || item.discount > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.discount > 0 && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                        Discount: -${item.discount.toFixed(2)}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[200px] truncate">
                        <span className="truncate">{item.notes}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Inline input expansions */}
                {isEditingThisNotes && (
                  <div className="mt-2 flex gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="Add note (E.g. Extra sauce, Pack)..."
                      defaultValue={item.notes || ''}
                      onBlur={(e) => {
                        updateItemNotes(item.productId, e.target.value);
                        setActiveRowEdit({ productId: '', field: null });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateItemNotes(item.productId, (e.target as HTMLInputElement).value);
                          setActiveRowEdit({ productId: '', field: null });
                        }
                      }}
                      className="flex-1 h-7 bg-slate-950 border border-slate-850 rounded px-2 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>
                )}

                {isEditingThisDiscount && (
                  <div className="mt-2 flex gap-1.5 items-center text-left">
                    <label className="text-[10px] text-slate-500 font-bold shrink-0">
                      Discount ($):
                    </label>
                    <input
                      type="number"
                      placeholder="Amount"
                      defaultValue={item.discount || ''}
                      onBlur={(e) => {
                        updateItemDiscount(item.productId, parseFloat(e.target.value) || 0);
                        setActiveRowEdit({ productId: '', field: null });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateItemDiscount(
                            item.productId,
                            parseFloat((e.target as HTMLInputElement).value) || 0,
                          );
                          setActiveRowEdit({ productId: '', field: null });
                        }
                      }}
                      className="w-24 h-7 bg-slate-950 border border-slate-850 rounded px-2 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                      autoFocus
                    />
                  </div>
                )}

                {/* Quantity and configuration buttons panel */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-900 pt-2.5">
                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1 border border-slate-800 bg-slate-950 rounded-md p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value) || 0)
                      }
                      className="w-10 bg-transparent border-none text-center text-xs font-bold text-slate-200 focus:outline-none focus:ring-0 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Config buttons panel */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Add note toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleRowEdit(item.productId, 'notes')}
                      className={cn(
                        'h-7 w-7 rounded-md border border-slate-850 text-slate-400 hover:text-slate-200',
                        item.notes && 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10',
                      )}
                      title="Line item notes"
                    >
                      <MessageSquareCode className="h-3.5 w-3.5" />
                    </Button>

                    {/* Add Item Discount toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleRowEdit(item.productId, 'discount')}
                      className={cn(
                        'h-7 w-7 rounded-md border border-slate-850 text-slate-400 hover:text-slate-200',
                        item.discount > 0 &&
                          'border-emerald-500/30 text-emerald-400 bg-emerald-950/10',
                      )}
                      title="Item Discount ($)"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                    </Button>

                    {/* Final Line Subtotal value */}
                    <span className="text-xs font-black font-mono text-emerald-400 shrink-0 min-w-[65px] text-right">
                      ${lineSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-850 rounded-xl text-slate-500">
            <ShoppingBag className="h-8 w-8 mb-2 text-slate-850" />
            <p className="text-xs font-medium">Active terminal workspace is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
