'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, X, User, Award, DollarSign, ShieldAlert } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customer';
import { usePOSStore } from '@/stores/pos.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export function CustomerSelector() {
  const { setCustomer, carts, activeCartId } = usePOSStore();
  const activeCart = carts.find((c) => c.id === activeCartId);
  const currentCustomer = activeCart?.customer;

  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [debouncedVal, setDebouncedVal] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVal(searchVal);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const { data: customerData, isLoading } = useCustomers({
    q: debouncedVal,
    limit: 10,
  });

  const customersList = customerData?.data || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: any) => {
    setCustomer(customer);
    setIsOpen(false);
    setSearchVal('');
  };

  const handleClearCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomer(null);
    toast.info('Reverted to Walk-in Customer.');
  };

  return (
    <div className="relative w-full z-20 select-none" ref={dropdownRef}>
      {/* Selector Trigger view */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer transition-colors duration-200',
          isOpen
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-slate-800 bg-[#0c1220] hover:border-slate-700',
        )}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <User
            className={cn(
              'h-4 w-4 shrink-0',
              currentCustomer ? 'text-emerald-400' : 'text-slate-500',
            )}
          />
          <div className="text-left min-w-0">
            <p
              className={cn(
                'text-xs font-semibold truncate',
                currentCustomer ? 'text-slate-100' : 'text-slate-400',
              )}
            >
              {currentCustomer ? currentCustomer.fullName : 'Walk-in Customer'}
            </p>
            {currentCustomer && (
              <p className="text-[10px] text-slate-400 truncate">
                Points: {currentCustomer.loyaltyPoints ?? 0} | Bal: $
                {Number(currentCustomer.currentBalance || 0).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {currentCustomer && (
            <button
              onClick={handleClearCustomer}
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              title="Clear Customer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-[10px] text-slate-500 uppercase tracking-widest px-1 py-0.5 rounded bg-slate-900 border border-slate-800">
            F2
          </span>
        </div>
      </div>

      {/* Customer Options list dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 border border-slate-800 bg-[#0c1220] rounded-lg shadow-2xl p-2 z-50">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search customers (Name, Code, Phone)..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs focus-visible:ring-emerald-500 h-9"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-4 text-xs text-slate-500">Searching accounts...</div>
            ) : customersList.length > 0 ? (
              customersList.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs text-left',
                    currentCustomer?.id === cust.id
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/60'
                      : 'hover:bg-slate-900 text-slate-300',
                  )}
                >
                  <div>
                    <p className="font-semibold text-slate-200">{cust.fullName}</p>
                    <p className="text-[10px] text-slate-500">
                      {cust.phone || 'No phone'} | {cust.customerCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-mono">
                      Bal: ${Number(cust.currentBalance || 0).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-mono">
                      Pts: {cust.loyaltyPoints ?? 0}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">No customers found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
